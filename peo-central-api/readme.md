# MCS ARCHITECTURE Boiler Plate

## MODEL-CONTROLLER-SERVICE ARCHITECTURE

## Project Structure

```
src\
 |--config\         # Environment variables and configuration related things
 |--constants\      # All constant variables
 |--controllers\    # Route controllers (controller layer)
 |--emails\         # all email templates
 |--middlewares\    # Custom express middlewares
 |--models\         # Mongoose models (data layer)
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app
 |--index.js        # App entry point
```

# MODEL

- where your schema is defined, may contain helper functions, hooks and plugins. what we have on version 1 is the same so no changes needed here

# SERVICES

- all business logic of our application should happen here. Samples of Business logics are database calls and manipulation, any calculations and third party application usage. may contain throwable errors during validation. a service can only be called by a controller and another service.

# CONTROLLER

- must not contain any business logic. request query and parameters validation are allowed here. responsible for calling services and returning the output to the client. Controller is like the manager and the services are the workers. Controller does not do any task or calculation, he assigns them to the services.

# ROUTES

- list of all routes and endpoints of our application. it should directly call the controller and must not have any logic. Middlewares are added here like request validation and token valdidation. Swagger documentation should also be added here. Currently you will notice most routes have logics inside. This is directly copied from the old api. We will slowly transfer it to its respected files once we have the time to refactor them.

# VALIDATION

- we can perform validation of request query, params and body on this file and attach them to the routes as middleware. this is to ensure and also serves as documentation for what an endpoint should only accept during a request. usage of validation is encouraged although its not required

In this architecture, this is the pathway of a rquest

ROUTES -> VALIDATION -> CONTROLLER -> SERVICES -> MODEL -> REVERSE

# ESLint

- to help us with clean coding and refactoring

# PASSPORT

- currently we are using two auth passports, 1 for user which is our staffs, and 1 for freelancers. This is to ensure that the tokens used among the two types of users are not equal for security purposes. we also separated the routes for the 2 types of users to easily implement the middlewares.

# SWAGGER

- api documentation. coming soon

# SESSION ACCESS

- if a user is loggedin, and accessing a private route, you can retrieve its data on any controller by using `req.user`.

# SECURITY GUIDELINES

1. IF YOU HAVE CLIENT AND ADMIN PORTALS, MAKE SURE THE ROUTES ARE SEPARATED AND HAS THEIR OWN MIDDLEWARE TO VERIFY TOKEN
2. IN THE CLIENT ROUTE, MAKE SURE TO NOT ALLOW THE CLIENT TO UPDATE ANYONE'S DATA USING AN ID

# CODING GUIDELINES

# Client Login Process

# Client Login process.

**Overview**

The client login process supports two primary methods:

1. **OTP Login:**
   - Initiated by providing the user's email address.
   - An OTP is generated and sent to the registered email address.
   - Upon receiving the OTP, the client submits the email, OTP, and OTP ID for verification.
   - Successful verification grants access and returns authentication tokens.

2. **Normal Login:**
   - Initiated by providing the user's email address, the provided otpId, otp, isPoc: true and OTPLogin: true parameters.
   - The server validates the credentials.
   - Successful authentication grants access and returns authentication tokens.

**OTP Login Flow (Detailed)**

1. **Initiation:**
   - Client provides the user's email address.
2. **User Verification:**
   - Server checks for a matching user record.
   - where user in this context is an existing Point of contact from the POC model.
        - All companies must have POC's for this login to be effected. 
   - If found (and the user is a POC), proceed to OTP generation.
3. **OTP Generation and Delivery:**
   - A unique OTP is generated.
   - An email containing the OTP and OTP ID is sent to the user's registered email address.
4. **Client OTP Input:**
   - Client receives the email and enters the OTP and OTP ID along with the email address.
5. **OTP Verification:**
   - Server verifies the provided OTP against the stored value.
6. **Authentication and Token Generation:**
   - Upon successful verification:
      - User information is retrieved.
      - Authentication tokens are generated for the user.
      - Response is sent with tokens, user data, and company details update status.
7. **Error Handling:**
   - Invalid OTP or user not found results in appropriate error messages.

**Normal Login Flow (Detailed)**

1. **Initiation:**
   - Client provides the user's email address and password.
2. **Credential Verification:**
   - Server validates the provided email and password against user records.
3. **Authentication and Token Generation:**
   - Upon successful authentication:
      - User information is retrieved.
      - Authentication tokens are generated for the user.
      - Response is sent with tokens and user data.
4. **Error Handling:**
   - Invalid credentials result in an error message.

**Important Notes:**

- OTPs have a 5-minute expiration time.
- The `handleOtpFlow` and `verifyOtpAndLogin` functions handle the core logic for OTP generation and verification, respectively.
- The `userLogin` function acts as the entry point for both OTP and normal login flows.

This README provides a concise overview of the client login process, highlighting the key steps and functionalities. 

**Disclaimer:** 
This is a simplified representation. Refer to the actual code for the most accurate and up-to-date information.

