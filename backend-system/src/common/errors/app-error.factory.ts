import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ErrorCodes } from './error-codes';

export const AppError = {

  userAlreadyExists: () =>
    new ConflictException({
      code: ErrorCodes.USER_ALREADY_EXISTS,
      message: 'El usuario ya existe',
    }),

  userNotFound: () =>
    new NotFoundException({
      code: ErrorCodes.USER_NOT_FOUND,
      message: 'Usuario no encontrado',
    }),

  roleNotFound: (role: string) =>
    new BadRequestException({
      code: ErrorCodes.ROLE_NOT_FOUND,
      message: `El rol ${role} no existe`,
    }),

  externalAuthError: (message?: string) =>
    new UnauthorizedException({
      code: ErrorCodes.EXTERNAL_AUTH_ERROR,
      message: message || 'Error al autenticarse con el proveedor externo',
    }),

  forbidden: (message?: string) =>
    new ForbiddenException({
      code: ErrorCodes.FORBIDDEN,
      message: message || 'Acceso denegado',
    }),

  conflict: (message?: string) =>
    new ConflictException({
      code: ErrorCodes.CONFLICT,
      message: message || 'Error de conflicto',
    }),

  notFound: (message?: string) =>
    new NotFoundException({
      code: ErrorCodes.NOT_FOUND,
      message: message || 'Recurso no encontrado',
    }),

  keycloakError: (detail?: string) =>
    new InternalServerErrorException({
      code: ErrorCodes.KEYCLOAK_ERROR,
      message: 'Error en Keycloak',
      detail,
    }),

  internal: (message?: string) =>
    new InternalServerErrorException({
      code: ErrorCodes.INTERNAL_ERROR,
      message: message || 'Error interno del servidor',
    }),

  // APPOINTMENT

  appointmentAlreadyExist: (pDate: string) =>
    new ConflictException({
      code: ErrorCodes.APPOINTMENT_ALREADY_EXIST,
      message: `Ya existe una cita en la fecha (${pDate})`,
    }),

  scheduleNotFound: (pDate: string) =>
    new NotFoundException({
      code: ErrorCodes.SCHEDULE_NOT_FOUND,
      message: `Horario ${pDate} no encontrado`,
    }),

  scheduleNotAvailable: (pDate: string) =>
    new ConflictException({
      code: ErrorCodes.SCHEDULE_NOT_AVAILABLE,
      message: `No hay disponibilidad en el horario (${pDate})`,
    }),

  doctorNotFound: (pId: string) =>
    new NotFoundException({
      code: ErrorCodes.DOCTOR_NOT_FOUND,
      message: `Medico ${pId} no encontrado`,
    }),

  invalidInput: () =>
    new ConflictException({
      code: ErrorCodes.INVALID_INPUT,
      message: 'Datos de entrada invalidos',
    }),

  invalidInterval: () =>
    new ConflictException({
      code: ErrorCodes.INVALID_INTERVAL,
      message: 'Intervalo invalido, verifique el horario enviado',
    }),

  appointmentNotFound:()=>
    new NotFoundException({
      code: ErrorCodes.APPOINTMENT_NOT_FOUND,
      message: 'La cita a editar no existe o no le pertenece',
    }),

  invalidAppointmentDate:(date: string)=>
    new ConflictException({
        code: ErrorCodes.SCHEDULE_NOT_AVAILABLE,
        message: `El horario ${date}  no se encuentra disponible para el medico`,
    }),

  scheduleAlreadyExist: (date: string)=>
      new ConflictException({
        code: ErrorCodes.INVALID_INTERVAL,
        message: `Ya tiene un horario asignado el ${date}, debe seleccionar otra franja`
      }),
  patientNotFound: (pId: string) =>
    new NotFoundException({
      code: ErrorCodes.NOT_FOUND,
      message: `El id ${pId} no corresponde a un paciente registrado`
    }),

  unavailabilityAlreadyExist: (pDate: string)=>
      new ConflictException({
        code: ErrorCodes.UNAVAILABILITY_ALREADY_EXIST,
        message: `Ya tiene registrada una indisponibilidad en la fecha ${pDate}`
      }),
  unavailabilityDoctor: (pDate: string)=>
      new ConflictException({
        code: ErrorCodes.UNAVAILABILITY_DOCTOR,
        message: `El doctor tiene una indisposicion en la fecha seleccionada ${pDate}`
      }),

  pastDate: (pDate: string)=>
    new ConflictException({
      code: ErrorCodes.INVALID_DATE,
      message: `La fecha ${pDate} ya paso, seleccione una futura maximo 2 semanas despues`
    }),
  
  veryDistantDate: (pDate: string)=>
    new ConflictException({
      code: ErrorCodes.INVALID_DATE,
      message: `La fecha ${pDate} es muy lejana, solo se puede reservar para maximo 2 semanas desde hoy`
    }),
  badRequest: (message?: string) =>
    new BadRequestException({
      code: ErrorCodes.INVALID_INPUT,
      message: message || 'Solicitud inválida',
    }),
  alreadyMarkToReschedule:(pId?: string) =>
      new ConflictException({
        code: ErrorCodes.APPOINTMENT_ALREADY_EXIST,
        message: `La cita seleccionada (Id: ${pId}) ya se encuentra asignada para reagendar`
      }),
  
  }