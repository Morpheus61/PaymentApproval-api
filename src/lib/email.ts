export async function sendEmail(to: string, subject: string, body: string) {
  // In a production environment, you would integrate with an email service
  // For demo purposes, we'll just log the email details
  console.log(`[${new Date().toISOString()}] Sending email at ${new Date().toISOString()}:`, {
    to,
    subject,
    body
  });
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return true;
}