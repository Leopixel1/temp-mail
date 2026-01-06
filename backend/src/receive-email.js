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

    // Process attachments with size and type validation
    const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB per attachment
    const ALLOWED_CONTENT_TYPES = [
      'image/', 'text/', 'application/pdf', 'application/zip',
      'application/msword', 'application/vnd.openxmlformats',
      'application/vnd.ms-excel'
    ];
    
    const attachments = parsed.attachments?.filter(att => {
      // Filter by size
      if (att.size > MAX_ATTACHMENT_SIZE) {
        console.log(`Attachment ${att.filename} too large: ${att.size} bytes`);
        return false;
      }
      // Filter by content type
      const allowed = ALLOWED_CONTENT_TYPES.some(type => att.contentType.startsWith(type));
      if (!allowed) {
        console.log(`Attachment ${att.filename} type not allowed: ${att.contentType}`);
        return false;
      }
      return true;
    }).map(att => ({
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
  // More robust email extraction handling various formats
  // Remove any display names and extract email from angle brackets
  const angleMatch = addressString.match(/<([^>]+)>/);
  if (angleMatch) {
    return angleMatch[1].trim().toLowerCase();
  }
  
  // Extract email using more comprehensive pattern
  const emailMatch = addressString.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (emailMatch) {
    return emailMatch[1].trim().toLowerCase();
  }
  
  // Fallback to simple extraction
  const simpleMatch = addressString.match(/([^\s]+@[^\s]+)/);
  return simpleMatch ? simpleMatch[1].trim().toLowerCase() : null;
}

processEmail();
