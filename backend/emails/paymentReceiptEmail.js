// emails/paymentReceiptEmail.js
export function paymentReceiptEmail({
  appName,
  employee,
  amount,
  method,
  reference,
  note,
}) {
  const title = `${appName} Payment Receipt`;
  const currency = "LKR";
  const amountText = `${currency} ${Number(amount).toFixed(2)}`;
  const methodText = String(method || "").toUpperCase();

  const html = `
  <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;padding:16px;">
    <h2 style="margin:0 0 8px;">${title}</h2>
    <div style="color:#6b7280;font-size:14px;margin-bottom:16px;">Reference: <strong>${reference}</strong></div>

    <table width="100%" style="border-collapse:collapse">
      <tr>
        <td style="padding:8px 0;color:#6b7280;">Employee</td>
        <td style="padding:8px 0;text-align:right;"><strong>${
          employee.name
        }</strong></td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;">Method</td>
        <td style="padding:8px 0;text-align:right;"><strong>${methodText}</strong></td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;">Amount</td>
        <td style="padding:8px 0;text-align:right;"><strong>${amountText}</strong></td>
      </tr>
      ${
        note
          ? `
      <tr>
        <td style="padding:8px 0;color:#6b7280;">Note</td>
        <td style="padding:8px 0;text-align:right;">${note}</td>
      </tr>`
          : ""
      }
      <tr>
        <td style="padding:8px 0;color:#6b7280;">Date</td>
        <td style="padding:8px 0;text-align:right;">${new Date().toLocaleString()}</td>
      </tr>
    </table>

    <p style="color:#6b7280;font-size:12px;margin-top:18px;">
      This is an automated receipt from ${appName}.
    </p>
  </div>`;

  const text = `${title}
Reference: ${reference}

Employee: ${employee.name}
Method: ${methodText}
Amount: ${amountText}
${note ? `Note: ${note}\n` : ""}Date: ${new Date().toLocaleString()}

This is an automated receipt from ${appName}.`;

  return { subject: `${appName} — Payment Receipt (${reference})`, html, text };
}
