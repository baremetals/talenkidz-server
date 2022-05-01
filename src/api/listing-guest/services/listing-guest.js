'use strict';

/**
 * listing-guest service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::listing-guest.listing-guest');
