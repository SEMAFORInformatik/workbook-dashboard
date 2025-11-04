/*
This file contains error messages used throughout the application.

They are spread in multiple arrays, the generic error messages belong to the genericErrors array,
more specific ones belong to their own array.
For example: groupErrors for errors relating to any group related requests

Error messages get their name and text, the name can be chosen any way you want,
if the chosen name is a possible value for responseText from a request it's easier to assign the correct message

Here is an example for getting the error-text based on a response

const errorMessage = groupErrors[error.response.statusText] ||
                      groupErrors[error.response.statusText] ||
                      error.response.statusText

This example first tries to get an appropriate message from the group messages, then the generic ones and if
it still doesn't find one it just gives the statusText.

The content of the error Message will be shown to users and thus should always be presentable and informative.

*/

export const genericErrors: any = {
  "Bad credentials": "Error: Credentials rejected. Please logout and then login again"
}

export const groupErrors: any = {
  "Bad Request": "Error: Group with the name \"${newName}\" already exists",
}

export interface DBServiceError {
  status: number;
  statusText: string;
  message: string;
}