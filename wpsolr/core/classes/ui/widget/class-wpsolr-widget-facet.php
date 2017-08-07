<?php

namespace wpsolr\core\classes\ui\widget;

use wpsolr\core\classes\exceptions\WPSOLR_Exception_Security;
use wpsolr\core\classes\extensions\localization\OptionLocalization;
use wpsolr\core\classes\services\WPSOLR_Service_Container;
use wpsolr\core\classes\ui\WPSOLR_Data_Facets;
use wpsolr\core\classes\ui\WPSOLR_UI_Facets;
use wpsolr\core\classes\WpSolrFilters;

/**
 * WPSOLR Widget Facets.
 *
 * Class WPSOLR_Widget_Facet
 * @package wpsolr\core\classes\ui\widget
 */
class WPSOLR_Widget_Facet extends WPSOLR_Widget {

	/**
	 * Register widget with WordPress.
	 */
	function __construct() {
		parent::__construct(
			'wpsolr_widget_facets', // Base ID
			__( 'WPSOLR Facets', 'wpsolr_admin' ), // Name
			[ 'description' => __( 'Display Solr Facets', 'wpsolr_admin' ), ] // Args
		);
	}

	/**
	 * Front-end display of widget.
	 *
	 * @see WP_Widget::widget()
	 *
	 * @param array $args Widget arguments.
	 * @param array $instance Saved values from database.
	 */
	public function widget( $args, $instance ) {

		if ( $this->get_is_show() ) {

			echo $args['before_widget'];

			try {

				$results = WPSOLR_Service_Container::get_solr_client()->display_results( WPSOLR_Service_Container::get_query() );

				$facets_to_display = apply_filters( WpSolrFilters::WPSOLR_FILTER_FACETS_TO_DISPLAY, WPSOLR_Service_Container::getOption()->get_facets_to_display() );

				echo '<div id="res_facets">' . WPSOLR_UI_Facets::Build(
						WPSOLR_Data_Facets::get_data(
							WPSOLR_Service_Container::get_query()->get_filter_query_fields_group_by_name(),
							$facets_to_display,
							$results[1]
						),
						OptionLocalization::get_options()
					) . '</div>';

			} catch ( WPSOLR_Exception_Security $e ) {

				echo $e->getMessage();
			}

			echo $args['after_widget'];
		}

	}

	/**
	 * Back-end widget form.
	 *
	 * @see WP_Widget::form()
	 *
	 * @param array $instance Previously saved values from database.
	 */
	/*
	public function form( $instance ) {
		$title = ! empty( $instance['title'] ) ? $instance['title'] : __( 'New title', 'wpsolr_admin' );
		?>
		<p>
			<label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e( 'Title:' ); ?></label>
			<input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>"
			       name="<?php echo $this->get_field_name( 'title' ); ?>" type="text"
			       value="<?php echo esc_attr( $title ); ?>">
		</p>
		<?php
	}*/
	public function form( $instance ) {
		?>
        <p>
            Position this widget where you want your facets to appear.
        </p>
        <p>
            Facets are dynamic filters users can click on to filter search results, like categories, or tags. Facets
            must have been defined in WPSOLR admin pages.
        </p>
        <p>
            In next releases of WPSOLR, you will be able to configure your widget layout, to match your theme layout.
        </p>

		<?php
	}

	/**
	 * Sanitize widget form values as they are saved.
	 *
	 * @see WP_Widget::update()
	 *
	 * @param array $new_instance Values just sent to be saved.
	 * @param array $old_instance Previously saved values from database.
	 *
	 * @return array Updated safe values to be saved.
	 */
	/*
	public function update( $new_instance, $old_instance ) {
		$instance          = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';

		return $instance;
	}*/

}