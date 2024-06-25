# Home Assistant Supabase Client Add-on

[![Release](https://img.shields.io/github/v/release/jamel-86/hassio_addons)](https://github.com/jamel-86/hassio_addons/releases)
[![License](https://img.shields.io/github/license/jamel-86/hassio_addons)](LICENSE)
[![Contributors](https://img.shields.io/github/contributors/jamel-86/hassio_addons)](https://github.com/jamel-86/hassio_addons/graphs/contributors)

## Overview

The Home Assistant Supabase Client add-on allows you to store all states and events from your Home Assistant instance directly into Supabase, providing a robust and scalable solution for data storage and analysis.

## Features

- **Real-time Event Streaming**: Stream all your Home Assistant events to Supabase in real time.
- **Entity Filtering**: Specify which entities to store in Supabase, or store all entities if no specific entities are provided.
- **Flexible Configuration**: Configure the add-on using the `options.json` file or environment variables.
- **Data Transformation**: Store both original and transformed event data for structured storage and easy querying.

## Installation

1. **Add the Repository**

[![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fjamel-86%2Fhassio_addons)

2. **Install the Add-on**

Find the Home Assistant Supabase Client add-on in the add-on store and click **Install**.

3. **Configure the Add-on**

After installation, navigate to the add-on's **Configuration** tab and set the necessary options:
```
  Supabase Url: https://[PROJECT-ID].supabase.co
  Supabase Key: [SUPABASE_KEY]
  Home Assistant url: http://homeassistant.local:8123
  Home Assistant Long Lived Token: "your-long-lived-access-token"
  entities: "[sensor.temperature, sensor.humidity, another, another]"
```

4. **SQL Setup Instructions**

To ensure that your Supabase instance is ready to store Home Assistant states and events, execute the following SQL queries to create the necessary tables:

Create `states` Table:
```
CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    entity_id TEXT NOT NULL,
    state TEXT,
    attributes JSONB,
    last_changed TIMESTAMP,
    last_updated TIMESTAMP
);
```

Create `events` Table:
```
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data JSONB,
    context JSONB,
    origin TEXT,
    time_fired TIMESTAMP
);
```

Create `transformed_events` Table:
```
CREATE TABLE transformed_events (
    id SERIAL PRIMARY KEY,
    entity_id TEXT NOT NULL,
    new_state JSONB,
    old_state JSONB,
    context_id TEXT,
    user_id TEXT,
    parent_id TEXT,
    last_changed TIMESTAMP,
    last_updated TIMESTAMP,
    last_reported TIMESTAMP
);
```

## Usage Instructions
### Environment Variables

Alternatively, you can configure the add-on using environment variables if you want to run it on an external server. Create a `.env` file in the root of your project with the following content:

```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
HOME_ASSISTANT_URL=http://your-home-assistant-url
HOME_ASSISTANT_TOKEN=your-long-lived-access-token
ENTITIES=sensor.temperature,sensor.humidity
```

### Running Locally
To run the script locally, ensure you have Node.js and ts-node installed. Then, execute the following command:

```
npx ts-node src/index.ts
```

## Contributing

Contributions are welcome! Please read the [contributing guidelines](https://github.com/jamel-86/hassio_addons/blob/master/CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/jamel-86/hassio_addons/blob/master/LICENSE) file for details.

## Changelog

All notable changes to this project are documented in the [Changelog](https://github.com/jamel-86/hassio_addons/blob/master/CHANGELOG.md).

## Acknowledgments

Thanks to the Home Assistant and Supabase communities for their support and contributions.

