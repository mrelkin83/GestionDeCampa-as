<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ReporteExport implements FromArray, WithHeadings
{
    public function __construct(protected array $datos)
    {
    }

    public function headings(): array
    {
        return $this->datos['detalle_columnas'] ?? [];
    }

    public function array(): array
    {
        return $this->datos['detalle'] ?? [];
    }
}
