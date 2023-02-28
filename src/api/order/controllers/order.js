'use strict';
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const { data } = ctx.request.body;

    if (!data) {
      return ctx.throw(400, "Please specify a product");
    }
    const { user } = ctx.state;

    // find the product being purchased
    const product = await strapi.db.query("api::product.product").findOne({
      where: { id: data.product },
      populate: { orders: true },
    });

    if (!product) {
      return ctx.throw(400, "The product does not exist");
    }

    if (data.SEO.type === "event") {
      const event = await strapi.service("api::event.event").create({
        data: { ...data.event, publishedAt: new Date() },
      });

      // Create the order
      const order = await strapi.service("api::order.order").create({
        data: {
          user: user.id,
          product: product.id,
          event: data.course,
          total: data.total,
          status: "completed",
          productType: product.type,
          stripeId: data.stripeId,
          publishedAt: new Date(),
        },
      });

      await strapi.service("api::event.event").update(event.id, {
        data: {
          order: order.id,
        },
      });

      await strapi.service("api::product.product").update(product.id, {
        data: {
          orders: product.orders.concat(order.id),
        },
      });

      //   const emailTemplate = {
      //     to: `${user.email}`, // recipient
      //     from: "Bare Metals Academy. <noreply@baremetals.io>", // Change to verified sender
      //     template_id: "d-5ac156026533444c9c559dc29368f392",
      //     dynamic_template_data: {
      //       courseTitle: course.title,
      //       subject: `Order Received`,
      //       username: `${user.username}`,
      //       buttonText: "View Order",
      //       url: `${process.env.FRONT_END_HOST}home/orders`,
      //       message: data.isFree
      //         ? "Your order has been processed. You will receive details of the course by email."
      //         : "Your order is being processed. You will receive payment confirmation shortly.",
      //     },
      //   };

      //   const adminEmailTemplate = {
      //     to: `${process.env.ADMIN_EMAIL}`, // recipient
      //     from: "Bare Metals Academy. <noreply@baremetals.io>", // Change to verified sender
      //     template_id: "d-5ac156026533444c9c559dc29368f392",
      //     dynamic_template_data: {
      //       courseTitle: course.title,
      //       subject: `New Free Order Received`,
      //       username: "Daniel",
      //       buttonText: "View Order",
      //       url: `${process.env.APP_URL}admin/content-manager/collectionType/api::order.order/${course.id}`,
      //       message: `You have a new order from ${user.username}`,
      //     },
      //   };

    //   await sgMail
    //     .send(emailTemplate)
    //     .then((res) => {
    //       console.log("Email sent", res[0].statusCode);
    //     })
    //     .catch((error) => {
    //       console.log(`Sending the verify email produced this error: ${error}`);
    //     });

    //   await sgMail
    //     .send(adminEmailTemplate)
    //     .then((res) => {
    //       console.log("Email sent", res[0].statusCode);
    //     })
    //     .catch((error) => {
    //       console.log(`Sending the verify email produced this error: ${error}`);
    //     });

      return { message: "order completed", event };
    } 
        // Else Block
    else {
      const listing = await strapi.service("api::listing.listing").create({
        data: { ...data.event, publishedAt: new Date() },
      });

      // Create the order
      const order = await strapi.service("api::order.order").create({
        data: {
          user: user.id,
          product: product.id,
          listing: data.course,
          total: data.total,
          status: "completed",
          productType: product.type,
          stripeId: data.sessionId,
          publishedAt: new Date(),
        },
      });

      await strapi.service("api::listing.listing").update(listing.id, {
        data: {
          order: order.id,
        },
      });

      await strapi.service("api::product.product").update(product.id, {
        data: {
          orders: product.orders.concat(order.id),
        },
      });

    //   const emailTemplate = {
    //     to: `${user.email}`, // recipient
    //     from: "Bare Metals Academy. <noreply@baremetals.io>", // Change to verified sender
    //     template_id: "d-5ac156026533444c9c559dc29368f392",
    //     dynamic_template_data: {
    //       courseTitle: course.title,
    //       subject: `Order Received`,
    //       username: `${user.username}`,
    //       buttonText: "View Order",
    //       url: `${process.env.FRONT_END_HOST}home/orders`,
    //       message: data.isFree
    //         ? "Your order has been processed. You will receive details of the course by email."
    //         : "Your order is being processed. You will receive payment confirmation shortly.",
    //     },
    //   };

    //   const adminEmailTemplate = {
    //     to: `${process.env.ADMIN_EMAIL}`, // recipient
    //     from: "Bare Metals Academy. <noreply@baremetals.io>", // Change to verified sender
    //     template_id: "d-5ac156026533444c9c559dc29368f392",
    //     dynamic_template_data: {
    //       courseTitle: course.title,
    //       subject: `New Free Order Received`,
    //       username: "Daniel",
    //       buttonText: "View Order",
    //       url: `${process.env.APP_URL}admin/content-manager/collectionType/api::order.order/${course.id}`,
    //       message: `You have a new order from ${user.username}`,
    //     },
    //   };

    //   await sgMail
    //     .send(emailTemplate)
    //     .then((res) => {
    //       console.log("Email sent", res[0].statusCode);
    //     })
    //     .catch((error) => {
    //       console.log(`Sending the verify email produced this error: ${error}`);
    //     });

    //   await sgMail
    //     .send(adminEmailTemplate)
    //     .then((res) => {
    //       console.log("Email sent", res[0].statusCode);
    //     })
    //     .catch((error) => {
    //       console.log(`Sending the verify email produced this error: ${error}`);
    //     });

        return { message: "order completed", listing };
    }
  },
}));
