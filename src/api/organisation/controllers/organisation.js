'use strict';

/**
 *  organisation controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::organisation.organisation', ({ strapi }) =>({
    async update(ctx) {
        const { id } = ctx.params;
        const user = ctx.state.user;
        const { body } = ctx.request;
        console.log(id)

        if (body.logo) {
            const response = await strapi
              .service("api::organisation.organisation")
              .update(id, {
                data: {
                  logo: body.logo,
                },
              });

            return response;
        } else {
            await strapi.entityService.update(
              "plugin::users-permissions.user",
              user.id,
              {
                data: {
                  username: body.username,
                  email: body.email,
                  bio: body.bio,
                  backgroundImg: body.backgroundImg,
                },
              }
            );

            const response = await strapi
              .service("api::organisation.organisation")
              .update(id, {
                data: {
                  slug: body.username,
                  name: body.name,
                  bio: body.bio,
                  website: body.website,
                  organisationType: body.organisationType,
                },
              });

            return response;
        }

        
    }
}));

