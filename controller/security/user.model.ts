// deno-lint-ignore-file no-explicit-any

import { TC_UserRole } from "../../enums/enums.ts";

export class userClass {
  id: number | undefined;
  name: string | undefined;
  email: string | undefined;
  roleid: number | undefined;
  roleDescripcion: string | undefined;
  estadoid: number | undefined;
  SessionexpiredIn: string | undefined;
  isAdmin: boolean | undefined;
  isGod: boolean | undefined;
  isNormal: boolean | undefined;

  saldo: number | undefined;


  constructor(usarFromDB: any) {
    this.id = usarFromDB['id'];
    this.name = usarFromDB['name'];
    this.email = usarFromDB['email'];
    
    this.roleid = usarFromDB['roleid'];
    this.estadoid = usarFromDB['estadoid'];
    
    this.isGod = this.roleid ===TC_UserRole.god;
    this.isAdmin = this.roleid ===TC_UserRole.admin || this.roleid ===TC_UserRole.god;    
    this.isNormal = this.roleid ===TC_UserRole.normal;

    this.saldo = usarFromDB['saldo'];

    this.roleDescripcion = this.roleid ===TC_UserRole.god ?  TC_UserRole[TC_UserRole.god] : (
      this.roleid ===TC_UserRole.admin ? TC_UserRole[TC_UserRole.admin] : TC_UserRole[TC_UserRole.normal]
    );

  }
};
