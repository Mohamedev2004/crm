<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        $amount = $this->faker->randomFloat(2, 50, 5000);
        $tax = $this->faker->randomFloat(2, 0, 500);
        $discount = $this->faker->randomFloat(2, 0, 200);
        $total = $amount + $tax - $discount;

        // Pick a random admin user
        $adminUser = User::where('role', 'admin')->inRandomOrder()->first();

        // Generate unique invoice number
        $invoiceNumber = strtoupper(Str::random(10));

        $invoiceData = [
            'user_id' => $adminUser ? $adminUser->id : User::factory(),
            'invoice_number' => $invoiceNumber,
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'amount' => $amount,
            'tax' => $tax,
            'discount' => $discount,
            'total' => $total,
            'status' => $this->faker->randomElement(['pending', 'paid', 'overdue']),
            'due_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'currency' => 'USD',
            'client_name' => $this->faker->name(),
            'client_email' => $this->faker->safeEmail(),
            'created_at' => $this->faker->dateTimeThisYear(),
            'updated_at' => now(),
        ];

        // Generate PDF
        $pdf = Pdf::loadView('invoices.pdf', ['invoice' => (object) $invoiceData]);
        $fileName = (string) Str::uuid() . '.pdf';
        $path = 'invoices/' . $fileName;
        Storage::disk('public')->put($path, $pdf->output());

        $invoiceData['file_path'] = $path;

        return $invoiceData;
    }
}
