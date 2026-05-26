export const APP_ROLES = [
  "ADMIN",
  "DOCTOR",
  "PATIENT",
  "SCHEDULER",
];

export const extractAppRoles = (
  roles: string[]
) => {

  return roles.filter((role) =>
    APP_ROLES.includes(role)
  );
};