<?php

namespace App\Exports;

use App\Models\Newsletter;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

class NewslettersExport implements FromCollection, WithHeadings, ShouldAutoSize
{
    /**
     * Return a collection of newsletters.
     */
    public function collection()
    {
        // Select only the columns you want
        return Newsletter::select('id', 'email' )->get();
    }

    /**
     * Add headings to the Excel sheet.
     */
    public function headings(): array
    {
        return [
            'ID',
            'Email',        
        ];
    }
}
