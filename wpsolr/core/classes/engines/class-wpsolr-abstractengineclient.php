<?php

namespace wpsolr\core\classes\engines;

use wpsolr\core\classes\services\WPSOLR_Service_Container;

/**
 * Class WPSOLR_AbstractEngineClient
 * @package wpsolr\core\classes\engines
 */
abstract class WPSOLR_AbstractEngineClient {

	// Engine types
	const ENGINE = 'index_engine';
	const ENGINE_ELASTICSEARCH = 'engine_elasticsearch';
	const ENGINE_ELASTICSEARCH_NAME = 'Elasticsearch';
	const ENGINE_SOLR = 'engine_solr';
	const ENGINE_SOLR_NAME = 'Apache Solr';

	// Timeout in seconds when calling Solr
	const DEFAULT_SEARCH_ENGINE_TIMEOUT_IN_SECOND = 30;

	protected $search_engine_client;

	protected $search_engine_client_config;

	// Indice of the Solr index configuration in admin options
	protected $index_indice;

	// Index
	public $index;


	// Array of active extension objects
	protected $wpsolr_extensions;

	// Is blog in a galaxy
	protected $is_in_galaxy;

	// Is blog a slave search
	protected $is_galaxy_slave;

	// Is blog a master search
	protected $is_galaxy_master;

	// Galaxy slave filter value
	protected $galaxy_slave_filter_value;

	// Custom fields properties
	protected $custom_field_properties;

	/**
	 * How many documents are in the index ?
	 * @return int
	 * @throws \Exception
	 */
	protected function search_engine_client_get_count_document() {
		throw new \Exception( 'Not implemented.' );
	}

	/**
	 * Create an client
	 *
	 * @param array $config
	 *
	 * @return object
	 */
	abstract protected function create_search_engine_client( $config );

	/**
	 * Execute an update query with the client.
	 *
	 * @param $search_engine_client
	 * @param $update_query
	 *
	 * @return WPSOLR_AbstractResultsClient
	 */
	abstract protected function search_engine_client_execute( $search_engine_client, $update_query );

	/**
	 * Init details
	 */
	protected function init() {

		$this->custom_field_properties = WPSOLR_Service_Container::getOption()->get_option_index_custom_field_properties();

		$this->init_galaxy();
	}

	/**
	 * Init galaxy details
	 */
	protected function init_galaxy() {

		$this->is_in_galaxy     = WPSOLR_Service_Container::getOption()->get_search_is_galaxy_mode();
		$this->is_galaxy_slave  = WPSOLR_Service_Container::getOption()->get_search_is_galaxy_slave();
		$this->is_galaxy_master = WPSOLR_Service_Container::getOption()->get_search_is_galaxy_master();

		// After
		$this->galaxy_slave_filter_value = get_bloginfo( 'blogname' );
	}

	/**
	 * Geenrate a unique post_id for sites in a galaxy, else keep post_id
	 *
	 * @param $post_id
	 *
	 * @return string
	 */
	protected function generate_unique_post_id( $post_id ) {

		if ( ! $this->is_in_galaxy ) {
			// Current site is not in a galaxy: post_id is already unique
			return $post_id;
		}

		// Create a unique id by adding the galaxy name to the post_id
		$result = sprintf( '%s_%s', $this->galaxy_slave_filter_value, $post_id );

		return $result;
	}
}
