#!/usr/bin/env node

/**
 * Email receiver script for Postfix
 * This script is called by Postfix pipe to process incoming emails
 * It reads email from stdin and stores it in the database
 */

const { simpleParser } = require('mailparser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function processEmail() {
  try {
    // Read email from stdin
    let emailData = '';
    
    process.stdin.setEncoding('utf8');
    
    for await (const chunk of process.stdin) {
      emailData += chunk;
    }

    // Parse email
    const parsed = await simpleParser(emailData);
    
    // Extract recipient address
    const to = parsed.to?.text || parsed.headers.get('to') || '';
    const toAddress = extractEmailAddress(to);
    
    if (!toAddress) {
      console.error('No recipient address found');
      process.exit(0); // Exit successfully to avoid bounce
    }

    // Find inbox
    const inbox = await prisma.inbox.findUnique({
      where: { address: toAddress },
      include: {
        user: true,
        emails: {
          orderBy: { receivedAt: 'desc' }
        }
      }
    });

    if (!inbox) {
      console.log(`Inbox not found for: ${toAddress}`);
      process.exit(0); // Exit successfully to avoid bounce
    }

    // Check email limit
    const settings = await prisma.systemSettings.findFirst();
    const maxEmails = inbox.user.maxEmails;
    
    if (settings?.deleteOldOnLimit && inbox.emails.length >= maxEmails) {
      // Delete oldest email
      const oldestEmail = inbox.emails[inbox.emails.length - 1];
      await prisma.email.delete({
        where: { id: oldestEmail.id }
      });
    } else if (inbox.emails.length >= maxEmails) {
      console.log(`Email limit reached for inbox: ${toAddress}`);
      process.exit(0);
    }

    // Process attachments
    const attachments = parsed.attachments?.map(att => ({
      filename: att.filename,
      contentType: att.contentType,
      size: att.size,
      // Store as base64
      content: att.content.toString('base64')
    })) || [];

    // Store email
    await prisma.email.create({
      data: {
        inboxId: inbox.id,
        from: parsed.from?.text || '',
        to: toAddress,
        subject: parsed.subject || '(no subject)',
        textBody: parsed.text || '',
        htmlBody: parsed.html || '',
        attachments: attachments.length > 0 ? attachments : null
      }
    });

    console.log(`Email received and stored for: ${toAddress}`);
    process.exit(0);
  } catch (error) {
    console.error('Error processing email:', error);
    process.exit(0); // Exit successfully to avoid bounce
  }
}

function extractEmailAddress(addressString) {
  const match = addressString.match(/<(.+?)>/) || addressString.match(/([^\s]+@[^\s]+)/);
  return match ? match[1].toLowerCase() : null;
}

processEmail();
