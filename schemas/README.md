# Changelog Schema Documentation

This document provides an overview of the `changelog.json` schema used in the Coinsaw backend. The schema defines the structure and validation rules for changelog entries related to bills and users and group information. 

## Changes Made

### Version 1
- **Bill Amount Field Update**: The `amount` field in the bill object has been updated to remove the `multipleOf` constraint and now includes a description clarifying that it should represent the total amount in the smallest currency unit (e.g., cents).
- **User Share Fields Update**: The `percentage` field in the user share object has been marked as deprecated, with a new `amount` field added. The `amount` field is intended to represent the absolute amount of the bill that the user has to pay, also in the smallest currency unit. The `percentage` field will be removed in future versions.
- **Versioning**: A `version` field has been added to the schema to track the version of the changelog entry.