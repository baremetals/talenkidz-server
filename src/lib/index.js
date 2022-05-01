async function createOrganisation(id, slug, logo) {
  // console.log(owner, recipient, slug)
  try {
    const entity = await strapi.service("api::organisation.organisation").create({
      data: {
        profile: id,
        slug,
        logo,
        publishedAt: new Date(),
      },
    });

    await strapi.entityService.update("plugin::users-permissions.user", id, {
      data: {
        organisation: entity.id,
      },
    });

    return entity;
  } catch (err) {
    console.log("error while creating", err);
  }
}

async function createCandidate(id) {
  // console.log(owner, recipient, slug)
  try {
    const entity = await strapi.service("api::candidate.candidate").create({
      data: {
        profile : id,
        publishedAt: new Date(),
      },
    });
    return entity;
  } catch (err) {
    console.log("error while creating", err);
  }
}

module.exports = {
  createCandidate,
  createOrganisation,
};