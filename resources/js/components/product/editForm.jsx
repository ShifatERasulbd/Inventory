import AddForm from './addForm';

export default function EditForm(props) {
    return (
        <AddForm
            {...props}
            title="Edit Product"
            description="Update the product details and save your changes."
            submitLabel="Update Product"
            submittingLabel="Updating..."
        />
    );
}
