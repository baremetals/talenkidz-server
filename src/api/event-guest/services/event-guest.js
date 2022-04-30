'use strict';

/**
 * event-guest service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::event-guest.event-guest');
