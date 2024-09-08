const generateMessage = (entity) => ({
    alreadyExist: `${entity} already exist`,
    notFound: `${entity} not found`,
    failToCreate: `Fail to create ${entity}`,
    failToUpdate: `Fail to update ${entity}`,
    failToDelete: `Fail to delete ${entity}`,
    failToGetAll: `Fail to get ${entity}s`,
    failToGetOne: `Fail to get ${entity}`,
    successCreate: `${entity} created successfully`,
    successUpdate: `${entity} updated successfully`,
    successDelete: `${entity} deleted successfully`,
    successFindAll: `Get ${entity}s successfully`,
    successFindOne: `Get ${entity} successfully`,
})

export const messages = {
    category: { ...generateMessage('Category'), successFindAll: `Get categories successfully` },
    subcategory: { ...generateMessage('Subcategory'), successFindAll: `Get subcategories successfully` },
    brand: generateMessage('Brand'),
    user: { ...generateMessage('User'), notAllowed: 'You are not authorized to access this api', successVerify: 'Account verified successfully' },
    product: generateMessage('Product'),
    review: generateMessage('Review'),
    cart: generateMessage('Cart'),
    order: generateMessage('Order'),
    coupon: generateMessage('Coupon'),
    file: { required: 'File is required', failToUpload: 'Fail to upload file', failToDelete: 'Fail to delete file' },
    files: { required: 'Files is required', failToUpload: 'Fail to upload files', failToDelete: 'Fail to delete files' },
}