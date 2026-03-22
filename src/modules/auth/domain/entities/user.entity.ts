import { Role } from './role.entity.js';

export class User {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly username: string,
        public readonly password: string,
        public readonly roles: Role[],
    ) { }
}
