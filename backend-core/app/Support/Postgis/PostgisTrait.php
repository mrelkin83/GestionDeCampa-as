<?php

namespace App\Support\Postgis;

use Illuminate\Support\Facades\DB;

trait PostgisTrait
{
    public function getPostgisFields(): array
    {
        return $this->postgisFields ?? [];
    }

    public function newQuery()
    {
        $query = parent::newQuery();

        $postgisFields = $this->getPostgisFields();
        if (!empty($postgisFields)) {
            $columns = ['*'];
            foreach ($postgisFields as $field) {
                $columns[] = DB::raw("ST_AsText(\"{$field}\") as \"{$field}\"");
            }
            $query->select($columns);
        }

        return $query;
    }

    public function setPostgisAttribute(string $key, $value): void
    {
        if ($value === null) {
            $this->attributes[$key] = null;
            return;
        }

        if (is_string($value) && preg_match('/^(POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON|GEOMETRYCOLLECTION)\s*\(/i', $value)) {
            $this->attributes[$key] = DB::raw("ST_GeomFromText('{$value}', 4326)");
            return;
        }

        $this->attributes[$key] = $value;
    }

    public function setAttribute($key, $value)
    {
        if (in_array($key, $this->getPostgisFields())) {
            $this->setPostgisAttribute($key, $value);
            return $this;
        }

        return parent::setAttribute($key, $value);
    }
}
