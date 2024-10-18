export enum TC_UserEstado {  
      activo = 1,
      baja = 2,
      bloqueado = 3,
      cambiar_pass = 4
}

export enum Validators{
    required = 1,
    email= 2
}

export enum TC_UserRole {  
    god = 1,
    admin = 2,
    normal = 3
}

export enum TC_MovimientoTipo {  
    reintegro = 1,  // pago apuesta
    ingreso = 2,    // aumento de saldo
    ganado = 3,      // repato premio
    inicial = 4    // cuando haga el transpaso de datos
}


export enum TC_ApuestaEstado {  
    abierta = 1,  
    cerrada = 2,    
    finalizada = 3      
}

export enum TC_BizumEstado {  
    pendiente = 1,  
    confirmado = 2,
    cerrado = 3,

}


export enum TC_Auditoria {  
    acceso = 1,  
    apuestas = 2,
    movimientos = 3,

}
