"use strict";
const utils = require("@strapi/utils");
/**
 * feature controller
 */

const { ApplicationError } = utils.errors;
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::feature.feature", ({ strapi }) => ({
  async find(ctx) {
    // console.log('==========>:', entity)
    try {
      let features = [];
      const entity = await strapi.service("api::feature.feature").find({
        filters: {
          status: { $eq: "active" },
        },
        // populate: { article: true, event: true, listing: true },
      });
      await entity.results.forEach(async (item) => {
        // const service = `api::${item.type}.${item.type}`;
        // console.log(item);

        // const entityItem = await strapi.db.query(service).findOne({
        //   where: { id: item.entityId },
        //   populate: { SEO: true, category: true },
        // });

        const object = {
          id: item.id,
          title: item.title,
          buttonText: item.buttonText,
          type: item.type,
          featureImage: item.featureImage,
          url: item.url,
        };
        // console.log(test)
        features.push(object);
      });
      const sanitizedFeatures = await this.sanitizeOutput(features, ctx);
      return this.transformResponse(sanitizedFeatures);
    } catch (e) {
    //   console.error(e);
      throw new ApplicationError(
        "Something is wrong please try again later or contact support"
      );
    }
  },
}));
