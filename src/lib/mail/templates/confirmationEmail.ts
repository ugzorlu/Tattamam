/* === Contracts ============================================================ */
/**
 * Props required to generate the email confirmation template.
 *
 * Encapsulates all dynamic and localized inputs needed to render a fully
 * structured transactional email, including user-specific data and assets.
 *
 * @property username - Recipient's display name.
 * @property resetLink - Unique verification URL containing confirmation token.
 * @property logoUrl - Publicly accessible logo URL used for branding.
 */
interface ConfirmationEmailProps {
	username: string
	verificationLink: string
	logoUrl: string
}

/* === Main Function ======================================================== */
/**
 * Generates a localized, production-grade email confirmation template.
 *
 * Returns both HTML and plain-text representations to ensure maximum
 * compatibility across email clients and improve deliverability.
 *
 * NOTE(DESIGN):
 * - Table-based layout for cross-client rendering consistency.
 * - Inline styles for maximum compatibility.
 * - Accessible structure and semantic fallback text.
 * - Dedicated CTA and feature highlight sections for engagement.
 *
 * @param props - See {@link ConfirmationEmailProps} for details.
 * @returns Object containing subject, text, and HTML email bodies.
 */
export function confirmationEmail({
	username,
	verificationLink,
	logoUrl,
}: ConfirmationEmailProps) {
	const subject = "E-posta Doğrulama"

	const welcome = "Tattamam'a hoş geldin!"

	const text = `Merhaba ${username},

    "Kayıt olduğun için teşekkür ederiz."
    "Aşağıdaki butona tıklayarak hesabını doğrulayabilirsin."

    "Doğrulayarak:"

    - "Seçimlerini hatırlatabilirsin."
    - "Denemek istediğin tarifleri kaydedebilirsin."

    ${verificationLink}
        `.trim()

	const html = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0;padding:0;background-color:#f9fafb;
    font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
                <td align="center" style="padding:24px;">
                    <table width="100%" max-width="480" 
                           style="background:#ffffff;
                           border-radius:12px;padding:24px;">
                        
                        <!-- Logo -->
                        <tr>
                            <td align="center" style="padding-bottom:16px;">
                                <img 
                                    src="${logoUrl}"
                                    alt="Tattamam"
                                    width="256"
                                    height="64"
                                    style="display:block; border-radius:12px;"
                                />
                            </td>
                        </tr>

                        <!-- Title -->
                        <tr>
                            <td style="font-size:20px;font-weight:600;
                                       text-align:center;padding-bottom:12px;">
                                ${welcome}
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="font-size:14px;color:#374151;
                                       text-align:center;padding-bottom:20px;">
                               Merhaba ${username},
                                <br/><br/>
                                Kayıt olduğun için teşekkür ederiz. Aşağıdaki
                                butona tıklayarak hesabını doğrulayabilirsin.
                            </td>
                        </tr>

                        <!-- CTA -->
                        <tr>
                            <td align="center">
                                <a href="${verificationLink}"
                                style="display:inline-block;padding:12px 20px;
                                       background-color:#570119;color:#ffffff;
                                       text-decoration:none;border-radius:8px;
                                       font-size:14px;">
                                   Doğrula
                                </a>
                            </td>
                        </tr>

                        <!-- Features / Value Proposition -->
                        <tr>
                            <td style="padding:16px 0;">
                                <table width="100%" cellpadding="0" 
                                       cellspacing="0" role="presentation">
                                    <tr>
                                        <td style="font-size:14px;
                                                   font-weight:600;
                                                   color:#111827;
                                                   padding-bottom:8px;
                                                   text-align:center;">
                                            Doğrulayarak:
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="font-size:13px;color:#374151;
                                                   text-align:center;
                                                   padding:4px 0;">
                                        • Seçimlerini hatırlatabilirsin.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="font-size:13px;color:#374151;
                                                   text-align:center;
                                                   padding:4px 0;">
                                        • Denemek istediğin tarifleri
                                        kaydedebilirsin.
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="font-size:12px;color:#9ca3af;
                                       text-align:center;padding-top:20px;">
                                Eğer bu isteği siz gerçekleştirmediyseniz,
                                bu e-postayı görmezden gelin.
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `.trim()

	return { subject, text, html }
}
