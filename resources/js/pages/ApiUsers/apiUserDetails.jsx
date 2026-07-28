import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Copy, Eye, EyeOff, ArrowLeft, Trash2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import Preloader from '@/components/Preloader';

import { deleteApiKey, fetchApiKeys, getApiKeyWithDecrypted } from './api';

function formatDate(value) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return date.toLocaleString();
}

export default function ApiUserDetails() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { setPageTitle } = useAppContext();
    const [apiKeys, setApiKeys] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [viewingKeyId, setViewingKeyId] = useState(null);
    const [decryptedKeys, setDecryptedKeys] = useState({});

    useEffect(() => {
        setPageTitle('API Key Details');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadApiKeys() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const keys = await fetchApiKeys();
                if (ignore) {
                    return;
                }

                const userKeys = Array.isArray(keys) ? keys.filter((key) => String(key.user?.id) === String(userId)) : [];
                setApiKeys(userKeys);
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load API keys.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadApiKeys();

        return () => {
            ignore = true;
        };
    }, [userId]);

    if (isLoading) {
         return (
                           <div className="relative min-h-[calc(100vh-220px)] overflow-hidden rounded-2xl bg-background">
                               <Preloader message="Loading API users..." fullScreen={false} />
                           </div>
                       );
    }

const userInfo = apiKeys.length > 0 ? apiKeys[0].user : null;

    const refreshApiKeys = async () => {
        const keys = await fetchApiKeys();
        const userKeys = Array.isArray(keys) ? keys.filter((key) => String(key.user?.id) === String(userId)) : [];
        setApiKeys(userKeys);
    };

    const handleDeleteKey = async (tokenId) => {
        setErrorMessage('');
        setDeletingId(tokenId);

        try {
            await deleteApiKey(tokenId);
            await refreshApiKeys();
        } catch (error) {
            setErrorMessage(error.message || 'Failed to revoke API key.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleViewKey = async (tokenId) => {
        if (decryptedKeys[tokenId]) {
            setViewingKeyId(viewingKeyId === tokenId ? null : tokenId);
            return;
        }

        try {
            const keyData = await getApiKeyWithDecrypted(tokenId);

            if (!keyData?.api_key) {
                setErrorMessage('This API key cannot be revealed. Generate a new key for this user.');
                setViewingKeyId(null);
                return;
            }

            setDecryptedKeys((prev) => ({
                ...prev,
                [tokenId]: keyData.api_key,
            }));
            setViewingKeyId(tokenId);
        } catch (error) {
            setErrorMessage(error.message || 'Failed to fetch API key.');
        }
    };

    const handleCopyKey = (key) => {
        navigator.clipboard.writeText(key);
    };

    return (
        <div className="space-y-5">
            <Button variant="outline" onClick={() => navigate('/api-user')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to API Users
            </Button>

            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            {userInfo && (
                <Card className="p-4">
                    <h2 className="text-lg font-semibold">{userInfo.name}</h2>
                    <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                </Card>
            )}

            <Card className="p-4">
                <h3 className="mb-4 font-semibold">API Keys</h3>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SL No</TableHead>
                                <TableHead>Key Name</TableHead>
                                <TableHead>API Key</TableHead>
                                <TableHead>Abilities</TableHead>
                                <TableHead>Last Used</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && apiKeys.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        No API keys for this user.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && apiKeys.map((token, index) => (
                                <TableRow key={token.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{token.name}</TableCell>
                                    <TableCell className="font-mono text-xs">
                                        <div className="flex items-center gap-2">
                                            <span>
                                                {viewingKeyId === token.id && decryptedKeys[token.id]
                                                    ? decryptedKeys[token.id]
                                                    : token.key_preview || '-'}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewKey(token.id)}
                                                title={viewingKeyId === token.id ? 'Hide key' : 'View key'}
                                            >
                                                {viewingKeyId === token.id ? (
                                                    <EyeOff className="h-3 w-3" />
                                                ) : (
                                                    <Eye className="h-3 w-3" />
                                                )}
                                            </Button>
                                            {viewingKeyId === token.id && decryptedKeys[token.id] && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCopyKey(decryptedKeys[token.id])}
                                                    title="Copy to clipboard"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {Array.isArray(token.abilities) ? token.abilities.join(', ') : '-'}
                                    </TableCell>
                                    <TableCell>{formatDate(token.last_used_at)}</TableCell>
                                    <TableCell>{formatDate(token.expires_at)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={deletingId === token.id}
                                            onClick={() => handleDeleteKey(token.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
