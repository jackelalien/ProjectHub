export const updateObject = (oldObject, updatedProperties) => {
    return {
        ...oldObject,
        ...updatedProperties
    };
}

//Use this throughout the application, where states are updated! He puts it in a shared folder.