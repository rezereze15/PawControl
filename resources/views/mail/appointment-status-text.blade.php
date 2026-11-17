@if (! empty($name))
Hi {{ $name }},

@endif
{{ $confirmed ? "Good news! We've confirmed your payment and your appointment." : "Unfortunately, we couldn't approve your appointment." }}

@if (! $confirmed && ! empty($reason))
Reason: {{ $reason }}

@endif
@foreach ($details as $label => $value)
{{ $label }}: {{ $value }}
@endforeach

{{ $confirmed ? 'Please arrive on time.' : 'You can book a new appointment from your PawControl dashboard.' }}
