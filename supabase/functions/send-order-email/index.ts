import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendOrderEmailRequest {
  order_id: string;
  email_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { order_id, email_id }: SendOrderEmailRequest = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "order_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_ORDERS_EMAIL") || "admin@zerobiotech.ca";

    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[send-order-email] Processing order ${order_id}`);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .maybeSingle();

    if (orderError || !order) {
      console.error(`[send-order-email] Order not found: ${order_id}`);
      throw new Error("Order not found");
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order_id);

    if (itemsError) {
      console.error(`[send-order-email] Failed to fetch items: ${itemsError.message}`);
      throw new Error("Failed to fetch order items");
    }

    const productsList = (orderItems || [])
      .map(
        (item: any) =>
          `<tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.product_price.toFixed(2)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.subtotal.toFixed(2)}</td>
          </tr>`
      )
      .join("");

    const taxRow = order.tax_amount && order.tax_amount > 0 
      ? `<tr>
          <td colspan="3" style="padding: 12px; text-align: right;"><strong>Tax (${order.tax_rate || '13'}%):</strong></td>
          <td style="padding: 12px; text-align: right;">$${order.tax_amount.toFixed(2)}</td>
        </tr>`
      : '';

    const emailSubject = `New Order #${order.order_number}`;
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #1f2937; margin: 0 0 8px 0;">🧬 Royal Peptides</h1>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">New Order Received</p>
        </div>

        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px;">📦 Order Confirmation</h3>
          <p style="color: #1e3a8a; margin: 0;">Order has been placed successfully. <strong>Tracking will be sent within 24 hours.</strong></p>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px;">Order ${order.order_number}</h2>
          <p style="color: #6b7280; margin: 4px 0;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleString('en-CA', { timeZone: 'America/Toronto' })}</p>
          <p style="color: #6b7280; margin: 4px 0;"><strong>Payment Method:</strong> Interac e-Transfer</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">Customer Information</h3>
          <p style="color: #4b5563; margin: 4px 0;"><strong>Name:</strong> ${order.customer_first_name} ${order.customer_last_name}</p>
          <p style="color: #4b5563; margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${order.customer_email}" style="color: #3b82f6;">${order.customer_email}</a></p>
          <p style="color: #4b5563; margin: 4px 0;"><strong>Phone:</strong> <a href="tel:${order.customer_phone}" style="color: #3b82f6;">${order.customer_phone}</a></p>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">Shipping Address</h3>
          <p style="color: #4b5563; margin: 4px 0;">${order.shipping_address}</p>
          <p style="color: #4b5563; margin: 4px 0;">${order.shipping_city}, ${order.shipping_province || ""} ${order.shipping_postal_code}</p>
          <p style="color: #4b5563; margin: 4px 0;">${order.shipping_country}</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e7eb;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb; color: #374151;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #374151;">Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #374151;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${productsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;"><strong>Subtotal:</strong></td>
                <td style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;">$${order.subtotal.toFixed(2)}</td>
              </tr>
              ${taxRow}
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right;"><strong>Shipping:</strong></td>
                <td style="padding: 12px; text-align: right;">$${order.shipping_fee.toFixed(2)}</td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;"><strong style="font-size: 16px;">Total:</strong></td>
                <td style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;"><strong style="font-size: 16px;">$${order.total.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px;">📬 Next Steps</h3>
          <p style="color: #78350f; margin: 4px 0;">• Process order in Admin Panel</p>
          <p style="color: #78350f; margin: 4px 0;">• Customer expects tracking within 24 hours</p>
          <p style="color: #78350f; margin: 4px 0;">• Use "Add Tracking + Send Email" button when shipped</p>
        </div>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 4px 0;">Royal Peptides - Premium Research Peptides</p>
          <p style="margin: 4px 0;">This is an automated notification</p>
        </div>
      </div>
    </body>
    </html>
    `;

    let currentEmailId = email_id;

    if (!currentEmailId) {
      console.log(`[send-order-email] Creating email queue entry`);
      const { data: queueData, error: queueError } = await supabase
        .rpc('queue_email', {
          p_email_type: 'order_confirmation',
          p_recipient_email: adminEmail,
          p_subject: emailSubject,
          p_html_body: emailHtml,
          p_order_id: order_id
        });

      if (queueError) {
        console.error(`[send-order-email] Failed to queue email: ${queueError.message}`);
        throw new Error(`Failed to queue email: ${queueError.message}`);
      }

      currentEmailId = queueData;
      console.log(`[send-order-email] Email queued with ID: ${currentEmailId}`);
    }

    let emailSent = false;
    let errorMessage = null;

    if (resendApiKey) {
      console.log(`[send-order-email] Sending via Resend to ${adminEmail}`);
      try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Royal Peptides <orders@zerobiotech.ca>",
            to: [adminEmail],
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        if (!resendResponse.ok) {
          const errorData = await resendResponse.text();
          console.error(`[send-order-email] Resend API error: ${errorData}`);
          errorMessage = `Resend API error: ${errorData}`;
        } else {
          const responseData = await resendResponse.json();
          emailSent = true;
          console.log(`[send-order-email] Email sent successfully:`, responseData);
        }
      } catch (emailError: any) {
        console.error(`[send-order-email] Email sending error: ${emailError.message}`);
        errorMessage = emailError.message;
      }
    } else {
      console.log(`[send-order-email] RESEND_API_KEY not configured - simulating send`);
      console.log(`[send-order-email] Would send to: ${adminEmail}`);
      console.log(`[send-order-email] Subject: ${emailSubject}`);
      errorMessage = "RESEND_API_KEY not configured";
    }

    if (emailSent) {
      await supabase.rpc('mark_email_sent', { p_email_id: currentEmailId });
      console.log(`[send-order-email] Marked email ${currentEmailId} as sent`);
    } else {
      await supabase.rpc('mark_email_failed', {
        p_email_id: currentEmailId,
        p_error_message: errorMessage || "Unknown error"
      });
      console.log(`[send-order-email] Marked email ${currentEmailId} as failed`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        email_sent: emailSent,
        email_id: currentEmailId,
        message: emailSent ? "Email sent successfully" : "Email queued for manual review",
        error: errorMessage
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[send-order-email] Error:", error);

    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
