@if (! empty($name))
Hi {{ $name }},

@endif
Payment received, thank you!

We've received your payment for {{ $pet }}'s visit at {{ $clinic['name'] }}. Your billing receipt is attached to this email as a PDF ({{ $fileName }}).

@foreach ($details as $label => $value)
{{ $label }}: {{ $value }}
@endforeach
Total paid: {{ $total }}

Questions about this receipt? Call us at {{ $clinic['contact'] }} or visit {{ $clinic['address'] }}.
