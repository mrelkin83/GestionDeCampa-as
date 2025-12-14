# EJEMPLOS JSON - CASOS DE USO REALES

Este documento contiene ejemplos JSON completos para los casos de uso más comunes de la plataforma.

---

## 🗳️ CENSO Y ESTRUCTURA ELECTORAL

### Votante del censo

```json
{
  "id": 12345678,
  "version_id": 3,
  "cedula": "1234567890",
  "primer_nombre": "María",
  "segundo_nombre": "Alejandra",
  "primer_apellido": "García",
  "segundo_apellido": "López",
  "fecha_nacimiento": "1995-05-15",
  "genero": "F",
  "mesa_id": 15234,
  "puesto_codigo": "E0525001005",
  "zona_numero": 5,
  "municipio_id": 25001,
  "departamento_id": 25,
  "created_at": "2027-09-05T10:00:00Z"
}
```

### Mesa electoral completa

```json
{
  "id": 15234,
  "numero": "00123",
  "tipo_mesa": "Ordinaria",
  "potencial_votantes": 342,
  "puesto": {
    "id": 5001,
    "codigo": "E0525001005",
    "nombre": "Colegio Santa María",
    "direccion": "Calle 45 #12-34, Bogotá",
    "ubicacion": {
      "type": "Point",
      "coordinates": [-74.0598, 4.6512]
    },
    "tipo": "Educativo",
    "capacidad_mesas": 15,
    "zona": {
      "id": 125,
      "numero": 5,
      "nombre": "Zona Electoral 5",
      "municipio": {
        "id": 25001,
        "codigo": "25001",
        "nombre": "Bogotá D.C.",
        "departamento": {
          "id": 25,
          "codigo": "25",
          "nombre": "Cundinamarca"
        }
      }
    }
  }
}
```

---

## 👥 CRM POLÍTICO

### Ficha completa de votante

```json
{
  "id": 123456,
  "campana_id": 1,
  "censo_electoral_id": 12345678,
  "cedula": "1234567890",
  "nombre_completo": "María Alejandra García López",
  "celular": "+573001234567",
  "telefono": "6011234567",
  "email": "maria.garcia@example.com",
  "direccion": "Carrera 7 #32-16, Apto 501, Bogotá",
  "ubicacion_real": {
    "type": "Point",
    "coordinates": [-74.0817, 4.6097]
  },
  "scoring": {
    "score_afinidad": 78,
    "probabilidad_voto": 0.82,
    "intencion_voto": "favorable",
    "ultima_actualizacion": "2027-09-15T10:30:00Z"
  },
  "segmentacion": {
    "tags": ["joven", "universitario", "profesional", "centro", "contacto_telefono"],
    "segmentos_ids": [5, 12, 34]
  },
  "historial_contacto": [
    {
      "id": 789123,
      "fecha": "2027-09-15T10:15:00Z",
      "tipo": "llamada",
      "canal": "telefono",
      "resultado": "compromiso_voto",
      "intencion_voto_declarada": "favorable",
      "notas": "Confirma asistencia a evento del 20/09. Preocupado por tema movilidad.",
      "usuario_registro": "coordinador@campana.com",
      "duracion_segundos": 180
    },
    {
      "id": 789122,
      "fecha": "2027-08-22T16:45:00Z",
      "tipo": "puerta_puerta",
      "canal": "visita_domicilio",
      "resultado": "indeciso",
      "notas": "Le preocupa el tema de seguridad. Solicitó más información sobre propuestas.",
      "lider": {
        "id": 456,
        "nombre": "María López"
      },
      "ubicacion": {
        "type": "Point",
        "coordinates": [-74.0817, 4.6097]
      }
    },
    {
      "id": 789121,
      "fecha": "2027-07-10T19:00:00Z",
      "tipo": "evento",
      "canal": "reunion_barrio",
      "resultado": "favorable",
      "notas": "Asistió a reunión barrio. Muy participativo. Ofreció ayudar con redes sociales.",
      "evento_id": 45
    }
  ],
  "lider_asignado": {
    "id": 456,
    "nombre": "María López",
    "celular": "+573009876543",
    "tipo": "Zona"
  },
  "ubicacion_censo": {
    "mesa_numero": "00123",
    "puesto": "Colegio Santa María",
    "zona": 5,
    "municipio": "Bogotá D.C.",
    "departamento": "Cundinamarca"
  },
  "origen": "puerta_puerta",
  "created_at": "2027-07-10T19:30:00Z",
  "updated_at": "2027-09-15T10:30:00Z"
}
```

### Líder político con estructura

```json
{
  "id": 456,
  "campana_id": 1,
  "votante_id": 123450,
  "nombre_completo": "María López Rodríguez",
  "cedula": "9876543210",
  "celular": "+573009876543",
  "email": "maria.lopez@example.com",
  "tipo": "Zona",
  "nivel_influencia": 8,
  "asignaciones": {
    "zonas": [
      {
        "id": 125,
        "numero": 5,
        "nombre": "Zona Electoral 5 - Kennedy",
        "total_mesas": 45,
        "votantes_potenciales": 15420
      }
    ],
    "puestos": [5001, 5002, 5003],
    "mesas": []
  },
  "estructura_bajo_mando": {
    "lideres_mesa": 12,
    "brigadistas": 35,
    "voluntarios": 89,
    "votantes_base": 3420
  },
  "metricas": {
    "contactos_realizados": 234,
    "conversion_favorable": 0.68,
    "eventos_organizados": 8,
    "asistencia_promedio": 45
  },
  "activo": true,
  "fecha_vinculacion": "2027-06-01",
  "created_at": "2027-06-01T10:00:00Z",
  "updated_at": "2027-09-20T14:00:00Z"
}
```

---

## 📊 SEGMENTACIÓN

### Segmento con criterios dinámicos

```json
{
  "id": 5,
  "campana_id": 1,
  "nombre": "Jóvenes Profesionales Bogotá Centro",
  "descripcion": "Votantes 25-40 años, profesionales, zona centro de Bogotá, con alta afinidad",
  "criterios": {
    "edad_min": 25,
    "edad_max": 40,
    "score_min": 70,
    "intencion_voto": ["favorable", "indeciso"],
    "tags": ["profesional", "universitario"],
    "municipios": [25001],
    "zonas": [1, 2, 3, 5],
    "genero": null,
    "con_celular": true,
    "con_email": true,
    "ultimo_contacto_max_dias": 30
  },
  "total_votantes": 1542,
  "distribucion": {
    "por_zona": {
      "1": 345,
      "2": 423,
      "3": 512,
      "5": 262
    },
    "por_intencion": {
      "favorable": 1108,
      "indeciso": 434
    },
    "por_score": {
      "70-79": 542,
      "80-89": 723,
      "90-100": 277
    }
  },
  "ultima_actualizacion": "2027-09-20T15:00:00Z",
  "created_at": "2027-08-01T10:00:00Z"
}
```

---

## 💰 DONACIONES Y COMPLIANCE

### Donación completa

```json
{
  "id": 123,
  "campana_id": 1,
  "donante": {
    "id": 45,
    "tipo": "persona_natural",
    "identificacion": "1234567890",
    "nombre_completo": "Carlos Gómez Pérez",
    "email": "carlos.gomez@example.com",
    "telefono": "+573001111111",
    "verificado": true,
    "fecha_verificacion": "2027-09-10T10:00:00Z"
  },
  "fecha": "2027-09-15",
  "monto": 5000000,
  "tipo": "transferencia",
  "concepto": "Donación voluntaria campaña alcaldía",
  "documentos": {
    "soporte": "https://s3.amazonaws.com/campaign/donaciones/donacion-123-comprobante.pdf",
    "recibo_generado": "https://s3.amazonaws.com/campaign/donaciones/recibo-123.pdf"
  },
  "estado": "aprobada",
  "aprobado_por": "admin@campana.com",
  "fecha_aprobacion": "2027-09-16T09:00:00Z",
  "metadata": {
    "banco": "Bancolombia",
    "cuenta_destino": "****5678",
    "referencia": "TRF123456789"
  },
  "created_at": "2027-09-15T14:30:00Z",
  "updated_at": "2027-09-16T09:00:00Z"
}
```

### Control de topes legales

```json
{
  "id": 1,
  "campana_id": 1,
  "campana": {
    "nombre": "Alcaldía Bogotá D.C. 2027",
    "candidato": "Juan Pérez"
  },
  "topes_legales": {
    "donaciones": {
      "tope_legal": 50000000,
      "total_actual": 40000000,
      "porcentaje": 80.0,
      "disponible": 10000000,
      "total_donantes": 23,
      "donacion_promedio": 1739130
    },
    "gastos": {
      "tope_legal": 100000000,
      "total_actual": 65000000,
      "porcentaje": 65.0,
      "disponible": 35000000
    }
  },
  "alertas": {
    "activa": true,
    "nivel": "media",
    "mensaje": "Donaciones al 80% del tope legal. Recomendado pausar recepción.",
    "umbral_critico": 90.0,
    "umbral_advertencia": 75.0
  },
  "proyeccion": {
    "dias_restantes_campana": 35,
    "tasa_donacion_diaria": 500000,
    "proyeccion_final": 47500000,
    "excede_tope": false
  },
  "updated_at": "2027-09-20T18:00:00Z"
}
```

---

## 📨 COMUNICACIÓN

### Campaña de comunicación (WhatsApp)

```json
{
  "id": 10,
  "campana_politica_id": 1,
  "nombre": "Recordatorio Día D - Últimas 24 horas",
  "tipo": "whatsapp",
  "segmento": {
    "id": 5,
    "nombre": "Jóvenes Profesionales Bogotá Centro",
    "total_votantes": 1542
  },
  "template": {
    "id": 12,
    "nombre": "Recordatorio Elecciones",
    "contenido": "¡Hola {{nombre}}! 👋\n\nMañana es el día. Recuerda:\n\n📍 Mesa: {{mesa}}\n🏫 Puesto: {{puesto}}\n⏰ Hora sugerida: 9:00 AM\n\n¡Tu voto es fundamental! 🗳️\n\n- Equipo {{candidato}}",
    "variables": ["nombre", "mesa", "puesto", "candidato"]
  },
  "programacion": {
    "programada_para": "2027-10-23T18:00:00Z",
    "zona_horaria": "America/Bogota"
  },
  "estado": "completada",
  "metricas": {
    "total_destinatarios": 1542,
    "total_enviados": 1542,
    "total_exitosos": 1520,
    "total_fallidos": 22,
    "total_entregados": 1515,
    "total_leidos": 1342,
    "tasa_exito": 98.57,
    "tasa_entrega": 99.67,
    "tasa_lectura": 88.54
  },
  "errores": [
    {
      "count": 15,
      "tipo": "numero_invalido",
      "mensaje": "Número de teléfono no válido para WhatsApp"
    },
    {
      "count": 7,
      "tipo": "bloqueado",
      "mensaje": "Usuario bloqueó el número de la campaña"
    }
  ],
  "costos": {
    "costo_por_mensaje": 150,
    "total_costo": 228000,
    "moneda": "COP"
  },
  "iniciada_at": "2027-10-23T18:00:05Z",
  "completada_at": "2027-10-23T18:45:32Z",
  "duracion_minutos": 45,
  "created_at": "2027-10-20T10:00:00Z"
}
```

---

## ⚡ DÍA D - ACTAS Y CONTEO

### Testigo electoral asignado

```json
{
  "id": 789,
  "campana_id": 1,
  "votante_id": 123789,
  "cedula": "9876543210",
  "nombre_completo": "Carlos Ramírez Gómez",
  "celular": "+573009876543",
  "email": "carlos.ramirez@example.com",
  "asignacion": {
    "mesa_principal": {
      "id": 15234,
      "numero": "00123",
      "puesto": {
        "codigo": "E0525001005",
        "nombre": "Colegio Santa María",
        "direccion": "Calle 45 #12-34, Bogotá",
        "ubicacion": {
          "lat": 4.6512,
          "lng": -74.0598
        }
      },
      "potencial_votantes": 342
    },
    "mesa_backup": {
      "id": 15235,
      "numero": "00124",
      "puesto": "Colegio Santa María"
    }
  },
  "credencial": {
    "numero": "TESTIGO-2027-001789",
    "pdf_url": "https://s3.amazonaws.com/campaign/credenciales/testigo-789.pdf",
    "qr_code": "https://s3.amazonaws.com/campaign/credenciales/qr-789.png"
  },
  "acceso_pwa": {
    "pin": "712945",
    "url": "https://pwa.plataforma-electoral.com",
    "instalado": true,
    "ultima_sincronizacion": "2027-10-24T06:30:00Z"
  },
  "estado_dia_d": {
    "estado": "reportando",
    "timeline": [
      {
        "estado": "asignado",
        "fecha": "2027-10-17T10:00:00Z"
      },
      {
        "estado": "confirmado",
        "fecha": "2027-10-23T15:00:00Z"
      },
      {
        "estado": "en_puesto",
        "fecha": "2027-10-24T06:32:00Z",
        "ubicacion": {"lat": 4.6512, "lng": -74.0598}
      },
      {
        "estado": "reportando",
        "fecha": "2027-10-24T16:35:00Z"
      }
    ],
    "acta_reportada": true,
    "acta_id": 987654
  },
  "capacitacion": {
    "simulacro_completado": true,
    "fecha_simulacro": "2027-10-22T14:05:00Z",
    "capacitacion_virtual": true,
    "fecha_capacitacion": "2027-10-23T09:00:00Z"
  },
  "created_at": "2027-10-17T10:00:00Z",
  "updated_at": "2027-10-24T16:35:00Z"
}
```

### Acta electoral completa

```json
{
  "id": 987654,
  "campana_id": 1,
  "mesa": {
    "id": 15234,
    "numero": "00123",
    "puesto": {
      "codigo": "E0525001005",
      "nombre": "Colegio Santa María",
      "direccion": "Calle 45 #12-34",
      "municipio": "Bogotá D.C.",
      "zona": 5
    }
  },
  "testigo": {
    "id": 789,
    "nombre_completo": "Carlos Ramírez Gómez",
    "cedula": "9876543210",
    "celular": "+573009876543"
  },
  "captura": {
    "fecha_captura": "2027-10-24T16:35:12Z",
    "hora_apertura": "08:00:00",
    "hora_cierre": "16:00:00",
    "ubicacion": {
      "lat": 4.6512,
      "lng": -74.0598,
      "accuracy": 8.5
    },
    "dispositivo": {
      "modelo": "Samsung Galaxy A32",
      "so": "Android 13",
      "app_version": "1.0.0"
    }
  },
  "imagen": {
    "url": "https://s3.amazonaws.com/campaign/actas/campana-1/mesa-15234-20271024.jpg",
    "hash_sha256": "a3f5b8c2e1d9f4a7b6c8e2d1f5a9b3c7e4d8f2a6b1c5e9f3a7b2c6d0e4f8a9b3",
    "size_bytes": 875420,
    "dimensions": {
      "width": 2048,
      "height": 1536
    },
    "formato": "JPEG",
    "compresion_aplicada": true
  },
  "datos_acta": {
    "votantes_habilitados": 342,
    "votos_depositados": 287,
    "participacion_porcentaje": 83.92,
    "votos": [
      {
        "candidato_id": 1,
        "candidato_nombre": "Juan Pérez (Nuestro Candidato)",
        "votos": 142,
        "porcentaje": 49.48
      },
      {
        "candidato_id": 2,
        "candidato_nombre": "Pedro González (Competidor A)",
        "votos": 98,
        "porcentaje": 34.15
      },
      {
        "candidato_id": 3,
        "candidato_nombre": "Ana Martínez (Competidor B)",
        "votos": 45,
        "porcentaje": 15.68
      }
    ],
    "votos_blancos": 1,
    "votos_nulos": 1,
    "total_votos": 287
  },
  "validaciones": {
    "suma_correcta": true,
    "suma_detalle": {
      "suma_candidatos": 285,
      "blancos": 1,
      "nulos": 1,
      "total_calculado": 287,
      "total_declarado": 287,
      "coincide": true
    },
    "votos_vs_habilitados": true,
    "votos_exceso": 0,
    "participacion_razonable": true,
    "participacion_min": 10.0,
    "participacion_max": 95.0,
    "consistencia_territorial": true,
    "promedio_mesas_vecinas": 84.5,
    "desviacion": -0.58
  },
  "ocr": {
    "procesado": true,
    "fecha_procesamiento": "2027-10-24T16:40:15Z",
    "confianza": 0.95,
    "servicio": "AWS Textract",
    "resultado": {
      "votantes_habilitados": 342,
      "votos_depositados": 287,
      "votos_candidato_principal": 142,
      "votos_competidor_a": 98,
      "votos_competidor_b": 45,
      "votos_nulos": 1,
      "votos_blancos": 1
    },
    "comparacion_manual": {
      "coincide": true,
      "diferencias": [],
      "tasa_coincidencia": 100.0
    }
  },
  "validacion_final": {
    "validada": true,
    "validada_por": "sistema_automatico",
    "validada_at": "2027-10-24T16:35:18Z",
    "metodo_validacion": "automatica",
    "inconsistencias": [],
    "alertas_generadas": []
  },
  "sincronizacion": {
    "offline_queue_id": "uuid-local-456abc",
    "sincronizado": true,
    "sincronizado_at": "2027-10-24T16:35:17Z",
    "tiempo_sincronizacion_segundos": 5,
    "intentos": 1,
    "conexion": "wifi"
  },
  "auditoria": {
    "firma_digital_testigo": {
      "pin_hash": "bcrypt:hash:here",
      "timestamp": "2027-10-24T16:35:12Z"
    },
    "cadena_custodia": [
      {
        "id": 10001,
        "accion": "creada",
        "usuario": "testigo-789",
        "timestamp": "2027-10-24T16:35:15Z",
        "hash": "abc123...xyz789"
      },
      {
        "id": 10002,
        "accion": "validada",
        "usuario": "sistema",
        "timestamp": "2027-10-24T16:35:18Z",
        "hash_anterior": "abc123...xyz789",
        "hash_actual": "def456...uvw012"
      }
    ],
    "integridad_cadena": true
  },
  "created_at": "2027-10-24T16:35:15Z",
  "updated_at": "2027-10-24T16:40:15Z"
}
```

### Conteo agregado (nivel municipio)

```json
{
  "id": 1250,
  "campana_id": 1,
  "nivel": "municipio",
  "entidad": {
    "id": 25001,
    "codigo": "25001",
    "nombre": "Bogotá D.C.",
    "departamento": "Cundinamarca"
  },
  "cobertura": {
    "total_mesas": 3120,
    "mesas_reportadas": 3089,
    "mesas_validadas": 3076,
    "mesas_con_alerta": 13,
    "mesas_pendientes": 31,
    "porcentaje_cobertura": 98.99,
    "porcentaje_validadas": 98.59
  },
  "resultados": {
    "candidatos": [
      {
        "candidato_id": 1,
        "nombre": "Juan Pérez",
        "partido": "Partido Ejemplo",
        "votos": 465234,
        "porcentaje": 48.72,
        "tendencia_ultima_hora": "+0.3",
        "tendencia_ultimas_100_mesas": "+0.5"
      },
      {
        "candidato_id": 2,
        "nombre": "Pedro González",
        "partido": "Otro Partido",
        "votos": 328567,
        "porcentaje": 34.41,
        "tendencia_ultima_hora": "-0.2",
        "tendencia_ultimas_100_mesas": "-0.1"
      },
      {
        "candidato_id": 3,
        "nombre": "Ana Martínez",
        "partido": "Tercer Partido",
        "votos": 158932,
        "porcentaje": 16.64,
        "tendencia_ultima_hora": "+0.1",
        "tendencia_ultimas_100_mesas": "0.0"
      }
    ],
    "votos_blancos": 1234,
    "votos_nulos": 1789,
    "total_votos": 955756,
    "participacion_promedio": 84.23
  },
  "desglose_territorial": [
    {
      "localidad_id": 1,
      "nombre": "Usaquén",
      "mesas_totales": 195,
      "mesas_reportadas": 187,
      "cobertura": 95.90,
      "votos_candidato_principal": 28456,
      "porcentaje": 52.30,
      "total_votos": 54389
    },
    {
      "localidad_id": 2,
      "nombre": "Chapinero",
      "mesas_totales": 102,
      "mesas_reportadas": 98,
      "cobertura": 96.08,
      "votos_candidato_principal": 14234,
      "porcentaje": 47.10,
      "total_votos": 30201
    }
  ],
  "estadisticas": {
    "primera_acta": "2027-10-24T16:35:15Z",
    "ultima_acta": "2027-10-24T20:15:34Z",
    "actas_por_hora": [
      {"hora": 16, "actas": 345},
      {"hora": 17, "actas": 1789},
      {"hora": 18, "actas": 856},
      {"hora": 19, "actas": 89},
      {"hora": 20, "actas": 10}
    ],
    "tiempo_promedio_reporte_minutos": 38
  },
  "comparativa_oficial": {
    "disponible": true,
    "fuente": "Registraduría Nacional",
    "cobertura_oficial": 85.0,
    "votos_oficial_candidato_principal": 441234,
    "porcentaje_oficial": 49.15,
    "diferencia_votos": -2967,
    "diferencia_porcentaje": -0.23,
    "confiabilidad": "alta",
    "dentro_margen_error": true,
    "margen_error_porcentaje": 1.0
  },
  "alertas_activas": [
    {
      "id": 4567,
      "tipo": "inconsistencia_aritmetica",
      "severidad": "alta",
      "mesa_id": 15678,
      "descripcion": "Suma de votos no coincide"
    }
  ],
  "updated_at": "2027-10-24T20:15:34Z"
}
```

---

## 🚨 ALERTAS

### Alerta crítica (fraude potencial)

```json
{
  "id": 4569,
  "campana_id": 1,
  "tipo": "fraude_potencial",
  "severidad": "critica",
  "titulo": "Votos exceden votantes habilitados",
  "descripcion": "Los votos depositados (265) exceden el número de votantes habilitados (250) en 15 votos (6%).",
  "mesa": {
    "id": 16789,
    "numero": "005678",
    "puesto": {
      "codigo": "E0525012034",
      "nombre": "Colegio Rural El Prado",
      "municipio": "Soacha",
      "zona": 12
    }
  },
  "acta": {
    "id": 987890,
    "testigo": {
      "id": 890,
      "nombre": "Pedro Sánchez",
      "celular": "+573005555555"
    },
    "imagen_url": "https://s3.amazonaws.com/campaign/actas/acta-987890.jpg"
  },
  "datos_detalle": {
    "votantes_habilitados": 250,
    "votos_depositados": 265,
    "exceso": 15,
    "porcentaje_exceso": 6.0,
    "votos_candidato_principal": 135,
    "participacion_calculada": 106.0
  },
  "regla_violada": {
    "codigo": "REGLA_002",
    "nombre": "Votos vs Votantes Habilitados",
    "descripcion": "Los votos depositados no pueden exceder el número de votantes habilitados"
  },
  "contexto_territorial": {
    "promedio_participacion_zona": 82.5,
    "promedio_participacion_municipio": 84.1,
    "desviacion_zona": 23.5,
    "mesas_vecinas_con_anomalias": 0
  },
  "acciones_sugeridas": [
    "Contactar testigo para verificar datos del E-14 original",
    "Revisar imagen del acta con lupa",
    "Comparar con E-24 consolidado cuando esté disponible",
    "Reportar a coordinador zona para investigación"
  ],
  "estado": {
    "actual": "confirmada",
    "asignado_a": "coordinador@campana.com",
    "prioridad": "alta",
    "requiere_accion_inmediata": true
  },
  "timeline": [
    {
      "estado": "generada",
      "fecha": "2027-10-24T17:30:15Z",
      "automatica": true
    },
    {
      "estado": "revisando",
      "fecha": "2027-10-24T17:35:00Z",
      "usuario": "coordinador@campana.com",
      "accion": "Contactando testigo"
    },
    {
      "estado": "confirmada",
      "fecha": "2027-10-24T17:45:00Z",
      "usuario": "coordinador@campana.com",
      "resolucion": "Testigo confirmó que E-14 oficial dice 265. Jurados también lo notaron y firmaron con observación. Anomalía real.",
      "accion_tomada": "Registrada para reporte post-electoral a autoridades"
    }
  ],
  "created_at": "2027-10-24T17:30:15Z",
  "updated_at": "2027-10-24T17:45:00Z"
}
```

---

## 📅 EVENTOS

### Evento con asistencia

```json
{
  "id": 15,
  "campana_id": 1,
  "nombre": "Marcha por la ciudad - Cierre de campaña",
  "tipo": "marcha",
  "descripcion": "Gran marcha de cierre de campaña. Punto de encuentro: Plaza de Bolívar. Recorrido por el centro histórico.",
  "fecha_inicio": "2027-10-22T14:00:00Z",
  "fecha_fin": "2027-10-22T18:00:00Z",
  "ubicacion": {
    "direccion": "Plaza de Bolívar, Carrera 7 con Calle 11, Bogotá",
    "coordenadas": {
      "lat": 4.5981,
      "lng": -74.0758
    },
    "municipio_id": 25001,
    "referencias": "Frente al Capitolio Nacional"
  },
  "organizacion": {
    "responsable": {
      "id": 456,
      "nombre": "María López",
      "celular": "+573009876543",
      "rol": "Coordinadora Eventos"
    },
    "equipo_logistica": [
      {"nombre": "Pedro Ramírez", "rol": "Seguridad"},
      {"nombre": "Ana Gómez", "rol": "Sonido"},
      {"nombre": "Luis Torres", "rol": "Tarima"}
    ]
  },
  "capacidad": {
    "estimada": 5000,
    "confirmados_previo": 3200,
    "asistentes_reales": 4780
  },
  "checkin": {
    "habilitado": true,
    "metodo": "qr_code",
    "qr_token": "uuid-evento-15-qr-token",
    "qr_code_url": "https://s3.amazonaws.com/campaign/eventos/qr-evento-15.png",
    "url_checkin": "https://pwa.plataforma-electoral.com/eventos/15/checkin"
  },
  "asistencia": {
    "total_registros": 4780,
    "por_metodo": {
      "qr_code": 3890,
      "manual": 890
    },
    "por_hora": [
      {"hora": "14:00", "asistentes": 1200},
      {"hora": "15:00", "asistentes": 2100},
      {"hora": "16:00", "asistentes": 1200},
      {"hora": "17:00", "asistentes": 280}
    ],
    "votantes_en_base": 3420,
    "nuevos_contactos": 1360,
    "tasa_conversion_votantes": 71.5
  },
  "impacto": {
    "antes_evento": {
      "favorables": 2145,
      "indecisos": 890,
      "opositor": 385
    },
    "despues_evento": {
      "favorables": 2890,
      "indecisos": 445,
      "opositor": 445
    },
    "conversion": {
      "indecisos_a_favorable": 445,
      "tasa_conversion": 50.0
    }
  },
  "multimedia": {
    "fotos": [
      "https://s3.../evento-15-foto-1.jpg",
      "https://s3.../evento-15-foto-2.jpg"
    ],
    "videos": [
      "https://s3.../evento-15-video-destacado.mp4"
    ],
    "redes_sociales": {
      "hashtag": "#BogotaConJuanPerez",
      "menciones": 2340,
      "alcance_estimado": 125000
    }
  },
  "presupuesto": {
    "estimado": 15000000,
    "gastado": 13500000,
    "desglose": {
      "sonido": 4000000,
      "tarima": 3000000,
      "seguridad": 2500000,
      "logistica": 2000000,
      "material_apoyo": 2000000
    }
  },
  "estado": "finalizado",
  "created_at": "2027-09-15T10:00:00Z",
  "updated_at": "2027-10-22T19:00:00Z"
}
```

---

**Última actualización:** Diciembre 13, 2024
