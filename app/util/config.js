module.exports = {

	// JWT
	jwt: {
		secret: 'despachalo.com',
		user: 'ug0QsrOddDG5y5dXpkR5V'
	},

	// Credenciales PuntoPagos
	puntoPagos: {
		test: {
			key: 'uIGQsrO2DABqy5XpkF4b',
			secret: 'lPS1gCbJSp49a0BrNuCF1nKnGgu6dApAX4h3SExm'
		},
		produccion: {
			key: '',
			secret: ''
		}
	},

	// Cotizaciones por tipo de Bolsa
	bag: {
		type: {
			visitor: '5',
			bronze: '30',
			silver: '90',
			gold: '0'
		}
	},

	// Tipos de usuario
	user: {
		type:{
			super: '1',
			admin: '2',
			client: '3'
		}
	},

	// Encriptador de contraseñas
	bcrypt: {
		rounds: 10
	},

	// boleta electronica
	ticket: {
		url: 'http://www.softnet.cl/sistems/contabilidad/integracionDTE/integra/webservices.php?wsdl',
		rut: '76360761-5',
		clave: 'Cw4WTtqm',
		ambiente: '0',
		tipoDteFactura: '33',
		tipoDteBoleta: '39',
		indServicio: '3',
		asignafolio: '1',
		cedible: '1'
	},

	// Servicios
	services: {
		chilexpress: {
			// REST
			georeferencia: {
				regiones: 'http://ws.ssichilexpress.cl/api/v1/georeferencia/regiones',
				comunas: 'http://ws.ssichilexpress.cl/api/v1/georeferencia/coberturas',
				direcciones: 'http://ws.ssichilexpress.cl/api/v1/georeferencia/direcciones'
			},
			// REST
			tarificar: 'http://ws.ssichilexpress.cl/api/v1/couriers?'
		},
		correoschile: {
			// Autenticación
			autenticacion: {
				usuario: 'PRUEBA WS 3',
				contrasena: '7d35cb8fb00a98cc7f99dabcd9d50da5'
			},
			// SOAP
			georeferencia: 'http://b2b.correos.cl:8008/ServicioRegionYComunasExterno/cch/ws/distribucionGeografica/externo/implementacion/ServicioExternoRegionYComunas.asmx?wsdl',
			// SOAP
			tarificar: 'http://b2b.correos.cl:8008/ServicioTarificacionCEPEmpresasExterno/cch/ws/tarificacionCEP/externo/implementacion/ExternoTarificacion.asmx?wsdl'
		},
		fedex: {
			autenticacion: {
				key: 'A6U1tb7eGU9NhLUd',
				password: 'rWcp1UYuNxiY62IiNJo8rlVAA',
				acountNumber: '510087488',
				meterNumber: '118738285'
			}
		}
	},

	// Servicio de correo
	mail: {
		user: 'manuelvargasmejia@gmail.com',
		pass: 'davidvargas+08',
		admin: 'mvargas@formax.cl',
		confirm: 'http://localhost:8084/desp/v1/users/validate/email?email=',
		confirmprod: 'http://www.despachalo.com:8084/desp/v1/users/validate/email?email='
	},

	// SendGrid API Key
	sendGrig: {
		key: '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'
	},

	// Development Environment
	development: {
		port: '8084',
		database: {
			host: '127.0.0.1',
			name: 'despachalo-dev'
		}
	},

	// Production Environment
	production: {
		port: '8084',
		database: {
			user: 'admin',
			pass: 'qpalwosk10',
			host: 'ds151068.mlab.com',
			port: '51068',
			name: 'despachalo-prod'
		}
	}
};