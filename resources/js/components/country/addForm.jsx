import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function AddForm() {
    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Country</CardTitle>
                <CardDescription>Fill in the country details and save to create a new record.</CardDescription>
            </CardHeader>

            <Separator />

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="country-name">Country Name</Label>
                            <Input id="country-name" name="name" placeholder="e.g. Bangladesh" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country-code">Country Code</Label>
                            <Input
                                id="country-code"
                                name="code"
                                placeholder="e.g. BD"
                                maxLength={3}
                                required
                            />
                        </div>

                       

                        <div className="space-y-2">
                            <Label htmlFor="currency-code">Currency Code</Label>
                            <Input
                                id="currency-code"
                                name="currencyCode"
                                placeholder="e.g. BDT"
                                maxLength={3}
                                required
                            />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button type="button" variant="outline" asChild>
                        <Link to="/countries">Cancel</Link>
                    </Button>
                    <Button type="submit">Create Country</Button>
                </CardFooter>
            </form>
        </Card>
    );
}