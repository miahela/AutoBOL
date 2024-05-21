# AutoBOL

This project automates the addition of order lines to Monday.com and the creation of BOL documents for multiple LTL carriers. 

## Setup

1. Clone the repository.
2. Install dependencies: `npm install`
3. Create a `.env` file and add your environment variables.
4. Start the server: `npm start`

## Features

- Retrieve orders from CommerceHub and email.
- Parse data and update Monday.com via API.
- Create BOLs on LTL carrier portals.