<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 12px; color: #1f2937; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        .subtitulo { color: #6b7280; margin-bottom: 20px; }
        .resumen { width: 100%; margin-bottom: 20px; }
        .resumen td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; }
        .resumen td.label { color: #6b7280; width: 60%; }
        .resumen td.valor { font-weight: bold; text-align: right; }
        h2 { font-size: 14px; margin-top: 24px; margin-bottom: 8px; border-bottom: 2px solid #2563eb; padding-bottom: 4px; }
        table.detalle { width: 100%; border-collapse: collapse; }
        table.detalle th { background: #eff6ff; text-align: left; padding: 6px 8px; font-size: 11px; }
        table.detalle td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
        .grafico-fila { margin-bottom: 6px; }
        .grafico-label { font-size: 11px; color: #374151; }
        .grafico-barra-fondo { background: #e5e7eb; width: 100%; height: 14px; border-radius: 3px; }
        .grafico-barra { background: #2563eb; height: 14px; border-radius: 3px; }
        .grafico-valor { font-size: 10px; color: #6b7280; }
        .footer { margin-top: 30px; font-size: 9px; color: #9ca3af; }
    </style>
</head>
<body>
    <h1>{{ $reporte->nombre }}</h1>
    <p class="subtitulo">
        {{ $reporte->descripcion }}
        @if($reporte->descripcion) &middot; @endif
        Generado el {{ now()->format('d/m/Y H:i') }}
    </p>

    <table class="resumen">
        @foreach($datos['resumen'] as $indicador => $valor)
            <tr>
                <td class="label">{{ $indicador }}</td>
                <td class="valor">{{ $valor }}</td>
            </tr>
        @endforeach
    </table>

    @if($reporte->incluir_graficos && !empty($datos['graficos']))
        @foreach($datos['graficos'] as $titulo => $serie)
            <h2>{{ $titulo }}</h2>
            @php $max = !empty($serie) ? max($serie) : 0; @endphp
            @foreach($serie as $etiqueta => $valor)
                <div class="grafico-fila">
                    <div class="grafico-label">{{ $etiqueta ?: 'Sin especificar' }} <span class="grafico-valor">({{ $valor }})</span></div>
                    <div class="grafico-barra-fondo">
                        <div class="grafico-barra" style="width: {{ $max > 0 ? round($valor / $max * 100) : 0 }}%"></div>
                    </div>
                </div>
            @endforeach
        @endforeach
    @endif

    @if($reporte->incluir_tablas_detalle && !empty($datos['detalle']))
        <h2>{{ $datos['detalle_titulo'] ?? 'Detalle' }}</h2>
        <table class="detalle">
            <thead>
                <tr>
                    @foreach($datos['detalle_columnas'] as $columna)
                        <th>{{ $columna }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach($datos['detalle'] as $fila)
                    <tr>
                        @foreach($fila as $valor)
                            <td>{{ $valor }}</td>
                        @endforeach
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <p class="footer">Plataforma Electoral Colombia &middot; Reporte #{{ $reporte->id }}</p>
</body>
</html>
