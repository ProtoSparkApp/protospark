export const getBrutalistEmailTemplate = (title: string, body: string, linkText?: string, linkUrl?: string) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,900&family=Inter:wght@400;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
  
  .card-shadow {
    box-shadow: 12px 12px 0px #000;
  }
  
  .btn-shadow {
    box-shadow: 6px 6px 0px #000;
  }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f0f0; font-family: 'Inter', Helvetica, Arial, sans-serif; color: #000;">
  <div style="background-color: #f0f0f0; padding: 40px 20px; font-family: 'Inter', Helvetica, Arial, sans-serif; color: #000; min-height: 100vh;">
    
    <!-- Header -->
    <div style="max-width: 600px; margin: 0 auto; text-align: center; margin-bottom: 20px;">
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-weight: 900; font-style: italic; font-size: 24px; text-transform: uppercase; margin: 0; letter-spacing: -0.5px; color: #000;">
        <span style="color: #6c72ff; font-style: normal;">⚡</span> PROTOSPARK
      </h1>
    </div>
    
    <div style="max-width: 600px; margin: 0 auto; border-bottom: 3px solid #000; margin-bottom: 40px;"></div>

    <!-- Main Box -->
    <div class="card-shadow" style="max-width: 600px; margin: 0 auto; background-color: #fff; border: 4px solid #000; padding: 0; overflow: hidden; position: relative;">
      
      <!-- Neo Brutalist Corner Shape -->
      <!-- In email clients pure CSS transform is risky, but we can do a simplified table with a border matching the design -->
      <table align="right" border="0" cellpadding="0" cellspacing="0" style="margin: 0; border-collapse: collapse;">
         <tr>
           <td style="background-color: #fde047; width: 140px; height: 180px; border-left: 4px solid #000; border-bottom: 4px solid #000;"></td>
         </tr>
      </table>

      <!-- Text Content -->
      <div style="padding: 50px 40px 50px 40px; clear: left;">
        <div style="font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #666; margin-bottom: 20px;">
          SECURITY PROTOCOL 0042
        </div>
        
        <h2 style="font-family: 'Playfair Display', Georgia, serif; font-weight: 900; font-size: 46px; line-height: 0.85; text-transform: uppercase; margin-top: 0; margin-bottom: 30px; letter-spacing: -1px; color: #000;">
          ${title.replace(/ /g, '<br/>')}
        </h2>
        
        <p style="font-size: 14px; line-height: 1.6; font-weight: 500; font-family: 'Inter', Helvetica, Arial, sans-serif; color: #333; margin-bottom: 40px; max-width: 320px;">
          ${body}
        </p>
        
        ${linkText && linkUrl ? `
          <a href="${linkUrl}" class="btn-shadow" style="display: inline-block; background-color: #988eff; color: #000; font-family: 'Inter', Helvetica, Arial, sans-serif; font-weight: 900; font-size: 15px; text-transform: uppercase; text-decoration: none; padding: 18px 32px; border: 3px solid #000; transition: all 0.2s;">
            ${linkText} &rarr;
          </a>
        ` : ''}
      </div>
    </div>
    
    <div style="max-width: 600px; margin: 40px auto 30px auto; border-bottom: 2px solid #000;"></div>

    <!-- Footer -->
    <div style="text-align: center; font-family: 'Space Mono', monospace; color: #888; max-width: 600px; margin: 0 auto;">
      <h3 style="font-family: 'Playfair Display', Georgia, serif; font-weight: 900; font-style: italic; font-size: 14px; color: #000; margin: 0 0 15px 0;">
        PROTOSPARK
      </h3>
      <div style="font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 15px; color: #888;">
        &copy; 2026 PROTOSPARK INDUSTRIAL SYSTEMS
      </div>
      <div style="font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 20px;">
        <a href="#" style="color: #888; text-decoration: none; margin: 0 10px;">PRIVACY POLICY</a>
        <a href="#" style="color: #888; text-decoration: none; margin: 0 10px;">TERMS OF SERVICE</a>
        <a href="#" style="color: #888; text-decoration: none; margin: 0 10px;">SUPPORT</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
