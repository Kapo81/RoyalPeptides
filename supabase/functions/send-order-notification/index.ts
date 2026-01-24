import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderNotificationRequest {
  orderId: string;
  source?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { orderId, source = 'webhook' }: OrderNotificationRequest = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Order ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if notification already sent successfully
    const { data: existingNotification } = await supabase
      .from("order_notifications")
      .select("*")
      .eq("order_id", orderId)
      .eq("success", true)
      .maybeSingle();

    if (existingNotification) {
      console.log(`Notification already sent for order ${orderId}. Skipping duplicate.`);
      return new Response(
        JSON.stringify({ success: true, message: "Notification already sent", duplicate: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (itemsError) {
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

    const paymentStatusBadge = order.payment_status === 'paid' 
      ? `<div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #065f46; margin: 0 0 8px 0; font-size: 16px;">✅ Payment Confirmed</h3>
          <p style="color: #047857; margin: 0;">Stripe payment successful. Order ready for processing.</p>
        </div>`
      : order.payment_method === "etransfer"
      ? `<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px;">⏳ Awaiting e-Transfer Payment</h3>
          <p style="color: #78350f; margin: 8px 0;"><strong>Customer should send to:</strong> 1984Gotfina@gmail.com</p>
          <p style="color: #78350f; margin: 8px 0;"><strong>Amount:</strong> $${order.total.toFixed(2)} CAD</p>
          <p style="color: #78350f; margin: 8px 0;"><strong>Reference:</strong> ${order.order_number}</p>
        </div>`
      : `<div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #991b1b; margin: 0 0 8px 0; font-size: 16px;">❌ Payment Pending</h3>
          <p style="color: #7f1d1d; margin: 0;">Awaiting payment confirmation.</p>
        </div>`;

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
          <p style="color: #6b7280; margin: 0; font-size: 14px;">New Order Notification</p>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px;">Order ${order.order_number}</h2>
          <p style="color: #6b7280; margin: 4px 0;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
          <p style="color: #6b7280; margin: 4px 0;"><strong>Payment Method:</strong> ${order.payment_method === "etransfer" ? "Interac e-Transfer" : "Stripe"}</p>
          <p style="color: #6b7280; margin: 4px 0;"><strong>Payment Status:</strong> <span style="text-transform: uppercase; font-weight: bold; color: ${order.payment_status === 'paid' ? '#10b981' : '#f59e0b'};">${order.payment_status}</span></p>
        </div>

        ${paymentStatusBadge}

        <div style="margin-bottom: 24px;">
          <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">Customer Information</h3>
          <p style="color: #4b5563; margin: 4px 0;"><strong>Name:</strong> ${order.customer_first_name} ${order.customer_last_name}</p>
          <p style="color: #4b5563; margin: 4px 0;"><strong>Email:</strong> ${order.customer_email}</p>
          <p style="color: #4b5563; margin: 4px 0;"><strong>Phone:</strong> ${order.customer_phone}</p>
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

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 4px 0;">Royal Peptides - Premium Research Peptides</p>
          <p style="margin: 4px 0;">This is an automated notification from your admin system</p>
        </div>
      </div>
    </body>
    </html>
    `;

    let emailSent = false;
    let errorMessage = null;

    if (resendApiKey) {
      try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Royal Peptides <orders@royalpeptides.com>",
            to: ["peptidesroyal@gmail.com"],
            subject: `🚨 New Order: ${order.order_number} - $${order.total.toFixed(2)} ${order.payment_status.toUpperCase()}`,
            html: emailHtml,
          }),
        });

        if (!resendResponse.ok) {
          const errorData = await resendResponse.text();
          console.error("Resend API error:", errorData);
          errorMessage = `Failed to send email: ${errorData}`;
        } else {
          emailSent = true;
          console.log(`Email sent successfully for order ${order.order_number}`);
        }
      } catch (emailError: any) {
        console.error("Email sending error:", emailError);
        errorMessage = emailError.message;
      }
    } else {
      console.log("RESEND_API_KEY not configured. Email would be sent to: peptidesroyal@gmail.com");
      console.log("Order:", order.order_number);
      console.log("Total:", order.total);
      console.log("Payment Status:", order.payment_status);
      // In test mode, consider it successful if we got here
      emailSent = true;
    }

    // Log the notification attempt
    await supabase
      .from("order_notifications")
      .insert({
        order_id: orderId,
        notification_method: source,
        success: emailSent,
        error_message: errorMessage,
      })
      .then(() => console.log(`Notification logged for order ${orderId}`))
      .catch((err) => console.error("Failed to log notification:", err));

    if (!emailSent && errorMessage) {
      throw new Error(errorMessage);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Order notification sent",
        emailSent,
        testMode: !resendApiKey
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending order notification:", error);
    
    // Log failed attempt
    try {
      const { orderId } = await req.clone().json();
      if (orderId) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const { createClient } = await import("npm:@supabase/supabase-js@2");
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from("order_notifications")
          .insert({
            order_id: orderId,
            notification_method: 'webhook',
            success: false,
            error_message: error.message,
          });
      }
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});