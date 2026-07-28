import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Preloader from '@/components/Preloader';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAppContext } from '@/context/AppContext';

import {
    createReceivedCartoonIssue,
    fetchReceivedCartoonIssues,
    fetchReceivedCartoons,
    receiveCartoonByScan,
} from './api';

function formatProducts(products) {
    if (!Array.isArray(products) || products.length === 0) {
        return 'N/A';
    }

    return products
        .map((item) => [item?.product_name, item?.color, item?.size].filter(Boolean).join(' - '))
        .filter(Boolean)
        .join(', ');
}

export default function ReceivedCartoons() {
    const { setPageTitle } = useAppContext();
    const [searchParams] = useSearchParams();
    const purchaseId = searchParams.get('purchase_id') || '';

    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [scanValue, setScanValue] = useState('');
    const [issues, setIssues] = useState([]);
    const [isLoadingIssues, setIsLoadingIssues] = useState(false);
    const [issueTargetRow, setIssueTargetRow] = useState(null);
    const [issueTitle, setIssueTitle] = useState('');
    const [issueDescription, setIssueDescription] = useState('');
    const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

    useEffect(() => {
        setPageTitle('Received Cartoons');
    }, [setPageTitle]);

    const loadRows = async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await fetchReceivedCartoons(purchaseId);
            setRows(Array.isArray(data) ? data : []);
        } catch (error) {
            setErrorMessage(error.message || 'Failed to load received cartoons.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRows();
    }, [purchaseId]);

    const loadIssues = async () => {
        setIsLoadingIssues(true);

        try {
            const data = await fetchReceivedCartoonIssues(purchaseId);
            setIssues(Array.isArray(data) ? data : []);
        } catch {
            setIssues([]);
        } finally {
            setIsLoadingIssues(false);
        }
    };

    useEffect(() => {
        loadIssues();
    }, [purchaseId]);

    const pendingCount = useMemo(() => rows.length, [rows]);

    if (isLoading) {
          return (
                            <div className="relative min-h-[calc(100vh-220px)] overflow-hidden rounded-2xl bg-background">
                                <Preloader message="Loading Received Cartons..." fullScreen={false} />
                            </div>
                        );
    }

    const handleScanSubmit = async (event) => {
        event.preventDefault();
        const value = scanValue.trim();

        if (!value) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            await receiveCartoonByScan(value);
            setScanValue('');
            toast.success('Cartoon received and stock updated.', {
                style: { color: '#16a34a' },
            });
            await loadRows();
        } catch (error) {
            const message = error.message || 'Failed to receive cartoon.';
            setErrorMessage(message);
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openIssueModal = (row) => {
        setIssueTargetRow(row);
        setIssueTitle(`Issue for PO ${row?.purchase?.po_number || row?.p_o_number || ''}`.trim());
        setIssueDescription('');
    };

    const handleSubmitIssue = async () => {
        if (!issueTargetRow) {
            return;
        }

        const normalizedTitle = issueTitle.trim();
        if (!normalizedTitle) {
            toast.error('Issue title is required.', {
                style: { color: '#dc2626' },
            });
            return;
        }

        try {
            setIsSubmittingIssue(true);

            await createReceivedCartoonIssue({
                purchase_id: Number(issueTargetRow?.purchase?.id ?? issueTargetRow?.p_o_number),
                cartoon_id: Number(issueTargetRow?.id),
                title: normalizedTitle,
                description: issueDescription.trim() || null,
            });

            toast.success('Issue raised successfully.', {
                style: { color: '#16a34a' },
            });

            setIssueTargetRow(null);
            setIssueTitle('');
            setIssueDescription('');
            await loadIssues();
        } catch (error) {
            toast.error(error.message || 'Failed to raise issue.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSubmittingIssue(false);
        }
    };

    return (
        <div className="space-y-5">
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            <Card>
                <CardHeader>
                    <CardTitle>Receive Cartoons To Stock</CardTitle>
                    <CardDescription>
                        Scan cartoon barcode to transfer scanned product barcodes into destination warehouse stock.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form className="space-y-2" onSubmit={handleScanSubmit}>
                        <Label htmlFor="scan-cartoon">Scan Cartoon Barcode</Label>
                        <div className="flex gap-2">
                            <Input
                                id="scan-cartoon"
                                value={scanValue}
                                onChange={(event) => setScanValue(event.target.value)}
                                placeholder="Scan cartoon number"
                                autoFocus
                            />
                            <Button type="submit" disabled={isSubmitting || !scanValue.trim()}>
                                {isSubmitting ? 'Receiving...' : 'Receive'}
                            </Button>
                        </div>
                    </form>
                    <p className="text-xs text-muted-foreground">
                        Pending cartoons: <span className="font-semibold text-foreground">{pendingCount}</span>
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Received Cartoons</CardTitle>
                    <CardDescription>
                        {purchaseId ? `Filtered by purchase ID: ${purchaseId}` : 'All received-status cartoons pending stock transfer'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cartoon</TableHead>
                                <TableHead>PO Number</TableHead>
                                <TableHead>Warehouse</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Issue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        Loading received cartoons...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No pending cartoons found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && rows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.cartoon_number}</TableCell>
                                    <TableCell>{row.purchase?.po_number || row.p_o_number || 'N/A'}</TableCell>
                                    <TableCell>{row.warehouse?.name || 'N/A'}</TableCell>
                                    <TableCell>{row.quantity ?? 0}</TableCell>
                                    <TableCell>{formatProducts(row.purchase?.products)}</TableCell>
                                    <TableCell>
                                        <Button type="button" size="sm" variant="outline" onClick={() => openIssueModal(row)}>
                                            Raise Issue
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Raised Receive Issues</CardTitle>
                    <CardDescription>
                        Accessible only to concerned warehouse users and super-admin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>PO</TableHead>
                                <TableHead>Cartoon</TableHead>
                                <TableHead>Warehouse</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Raised By</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingIssues && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        Loading issues...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoadingIssues && issues.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        No issues found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoadingIssues && issues.map((issue) => (
                                <TableRow key={issue.id}>
                                    <TableCell>{issue.po_number || `PO #${issue.purchase_id}`}</TableCell>
                                    <TableCell>{issue.cartoon_number || 'N/A'}</TableCell>
                                    <TableCell>{issue.concern_warehouse_name || 'N/A'}</TableCell>
                                    <TableCell>{issue.title}</TableCell>
                                    <TableCell>{issue.raised_by_name || 'N/A'}</TableCell>
                                    <TableCell className="capitalize">{issue.status || 'open'}</TableCell>
                                    <TableCell>{issue.created_at || 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog
                open={Boolean(issueTargetRow)}
                onOpenChange={(open) => {
                    if (!open) {
                        setIssueTargetRow(null);
                        setIssueTitle('');
                        setIssueDescription('');
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Raise Receive Issue</AlertDialogTitle>
                        <AlertDialogDescription>
                            Raise issue for PO {issueTargetRow?.purchase?.po_number || issueTargetRow?.p_o_number || 'N/A'}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="issue_title">Title</Label>
                            <Input
                                id="issue_title"
                                value={issueTitle}
                                onChange={(event) => setIssueTitle(event.target.value)}
                                placeholder="Issue title"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="issue_description">Description (optional)</Label>
                            <textarea
                                id="issue_description"
                                value={issueDescription}
                                onChange={(event) => setIssueDescription(event.target.value)}
                                placeholder="Describe the issue"
                                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmittingIssue}>Cancel</AlertDialogCancel>
                        <Button type="button" disabled={isSubmittingIssue} onClick={handleSubmitIssue}>
                            {isSubmittingIssue ? 'Saving...' : 'Raise Issue'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
