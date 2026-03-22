/**
 * Represents the many-to-many relationship between User and Role.
 * Useful for explicit tracking of role assignments.
 */
export class UserRole {
    constructor(
        public readonly userId: string,
        public readonly roleId: string,
    ) { }
}
