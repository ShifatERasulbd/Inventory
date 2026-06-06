import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProductBasicInfo from './sections/ProductBasicInfo';
import ProductSelections from './sections/ProductSelections';
import ProductImages from './sections/ProductImages';
import ProductDescription from './sections/ProductDescription';

export default function AddForm(props) {
    const {
        onSubmit,
        onCancel,
        isSubmitting,
    } = props;

    return (
        <Card>
            <CardHeader className="space-y-1 pb-2">
                <CardTitle>Product Form</CardTitle>
                <CardDescription>
                    Fill in product details, attach images, and save to create a new product record.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
                <section className="rounded-lg border bg-muted/20 p-4 md:p-5">
                    <ProductBasicInfo {...props} />
                </section>

                <section className="rounded-lg border bg-muted/20 p-4 md:p-5">
                    <ProductSelections {...props} />
                </section>

                <section className="rounded-lg border bg-muted/20 p-4 md:p-5">
                    <ProductImages {...props} />
                </section>

                <section className="rounded-lg border bg-muted/20 p-4 md:p-5">
                    <ProductDescription {...props} />
                </section>
            </CardContent>

            <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={onSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Product'}
                </Button>
            </CardFooter>
        </Card>
    );
}