import { supabase } from "./supabase-client";

export const saveOrderToDatabase = async (orderData) => {
  let savedOrder = null;

  try {
    // Prepare order data
    const orderForDB = {
      id: orderData.id,
      customer_id: orderData.customer_id,
      customer_name: orderData.customerInfo?.name || orderData.customerName,
      customer_email: orderData.customerInfo?.email || orderData.customerEmail,
      customer_phone: orderData.customerInfo?.phone || orderData.customerPhone,
      customer_address:
        orderData.customerInfo?.address || orderData.customerAddress,
      customer_city: orderData.customerInfo?.city || orderData.customerCity,
      customer_company:
        orderData.customerInfo?.company || orderData.customerCompany || null,
      subtotal: orderData.pricing?.subtotal || orderData.subtotal,
      tax: orderData.pricing?.tax || orderData.tax,
      shipping: orderData.pricing?.shipping || orderData.shipping,
      discount: orderData.pricing?.discount || orderData.discount || 0,
      total: orderData.pricing?.total || orderData.total,
      payment_method: orderData.paymentMethod,
      payment_status: orderData.paymentStatus || "pending",
      payment_reference: orderData.paymentReference || null,
      status: orderData.status || "pending",
      paystack_data: orderData.paystackData
        ? JSON.stringify(orderData.paystackData)
        : null,
    };

    // Step 1: Save the order
    const { data: orderResult, error: orderError } = await supabase
      .from("orders")
      .insert([orderForDB])
      .select()
      .single();

    if (orderError) throw orderError;

    savedOrder = orderResult;
    console.log("Order saved successfully:", orderResult.id);

    // Step 2: Save order items
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map((item) => ({
        order_id: orderResult.id,
        product_id: item.id || item.product_id,
        quantity: item.quantity,
        price: item.price || item.unit_price,
      }));

      const { data: itemsResult, error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems)
        .select();

      if (itemsError) {
        // Rollback: delete the order if items failed
        await supabase.from("orders").delete().eq("id", orderResult.id);
        throw itemsError;
      }

      console.log(`Successfully saved ${itemsResult.length} order items`);

      // Return order with items
      return {
        ...orderResult,
        items: itemsResult,
      };
    }

    return orderResult;
  } catch (error) {
    console.error("Transaction failed:", error);

    // If we saved an order but failed later, try to clean up
    if (savedOrder) {
      try {
        await supabase.from("orders").delete().eq("id", savedOrder.id);
        console.log("Rolled back saved order due to error");
      } catch (rollbackError) {
        console.error("Failed to rollback order:", rollbackError);
      }
    }

    throw error;
  }
};

// Helper function to get complete order details (for admin dashboard)
export const getOrderWithItems = async (orderId) => {
  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) throw orderError;

    // Get order items with product details
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `
        *,
        products (
          name,
          sku,
          images
        )
      `
      )
      .eq("order_id", orderId);

    if (itemsError) throw itemsError;

    return {
      ...order,
      items: items,
    };
  } catch (error) {
    console.error("Failed to get order with items:", error);
    throw error;
  }
};

// Helper function for admin dashboard - get all orders with summary
export const getAllOrdersForAdmin = async (limit = 50, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from("admin_orders_view") // Using the view we created
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to get orders for admin:", error);
    throw error;
  }
};

export const findOrderByReference = async (reference) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("payment_reference", reference)
      .single();

    if (error) {
      console.error("Supabase select error:", error);
      return null;
    }

    // Parse JSON fields
    if (data.items) {
      data.items = JSON.parse(data.items);
    }
    if (data.paystack_data) {
      data.paystack_data = JSON.parse(data.paystack_data);
    }

    return data;
  } catch (error) {
    console.error("Failed to find order by reference:", error);
    return null;
  }
};

export const findOrderById = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Supabase select error:", error);
      return null;
    }

    // Parse JSON fields
    if (data.items) {
      data.items = JSON.parse(data.items);
    }
    if (data.paystack_data) {
      data.paystack_data = JSON.parse(data.paystack_data);
    }

    return data;
  } catch (error) {
    console.error("Failed to find order by ID:", error);
    return null;
  }
};
