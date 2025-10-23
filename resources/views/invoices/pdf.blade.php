<!DOCTYPE html>
<html>
<head>
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; }
    </style>
</head>
<body>
    <h1>Invoice #{{ $invoice->invoice_number }}</h1>
    <p><strong>Client:</strong> {{ $invoice->client_name }} ({{ $invoice->client_email }})</p>
    <p><strong>Title:</strong> {{ $invoice->title }}</p>
    <p><strong>Description:</strong> {{ $invoice->description }}</p>
    <table>
        <tr>
            <th>Amount</th>
            <th>Tax</th>
            <th>Discount</th>
            <th>Total</th>
        </tr>
        <tr>
            <td>{{ $invoice->amount }}</td>
            <td>{{ $invoice->tax }}</td>
            <td>{{ $invoice->discount }}</td>
            <td>{{ $invoice->total }}</td>
        </tr>
    </table>
    {{-- <p><strong>Status:</strong> {{ ucfirst($invoice->status) }}</p> --}}
    <p><strong>Due Date:</strong> {{ $invoice->due_date?->format('d/m/Y') }}</p>
</body>
</html>
