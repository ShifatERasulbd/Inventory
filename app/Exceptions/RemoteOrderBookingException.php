<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown when a remote order is missing data required to book it with Veeqo
 * (e.g. no shipping address, no line items, or no local SKU) as opposed to a
 * genuine upstream/network failure. Controllers should map this to a 422.
 */
class RemoteOrderBookingException extends RuntimeException
{
}
