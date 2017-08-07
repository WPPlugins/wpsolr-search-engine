<?php

namespace wpsolr\core\classes\ui;

use wpsolr\core\classes\extensions\localization\OptionLocalization;
use wpsolr\core\classes\utilities\WPSOLR_Option;
use wpsolr\core\classes\WpSolrFilters;


/**
 * Display facets
 *
 * Class WPSOLR_UI_Facets
 * @package wpsolr\core\classes\ui
 */
class WPSOLR_UI_Facets {

	const WPSOLR_FACET_CHECKBOX_CLASS = 'wpsolr_facet_checkbox';
	const WPSOLR_FACET_RADIOBOX_CLASS = 'wpsolr_facet_radiobox';
	const WPSOLR_FACET_COLOR_PICKER = 'wpsolr_facet_color_picker';
	const CLASS_PREFIX = 'wpsolr_facet';
	const TEMPLATE_LINK_REL_ATTRIBUTE = 'rel="%s"';
	const PERMALINK_LINK_TEMPLATE = '<a class="wpsolr_permalink" href="%s" %s title="%s">%s</a>';

	/**
	 * Build facets UI
	 *
	 * @param array $facets
	 * @param $localization_options array
	 *
	 * @return string
	 */
	public static function Build( $facets, $localization_options ) {

		$html = apply_filters( WpSolrFilters::WPSOLR_FILTER_FACETS_REPLACE_HTML, null, $facets, $localization_options );
		if ( null !== $html ) {
			return $html;
		}

		// Starts with some custom css.
		$html = apply_filters( WpSolrFilters::WPSOLR_FILTER_FACETS_CSS, '' );

		if ( ! empty( $facets ) ) {

			$facets_template = OptionLocalization::get_term( $localization_options, 'facets_element' );
			$facet_title     = OptionLocalization::get_term( $localization_options, 'facets_title' );

			foreach ( $facets as $facet ) {

				$html .= sprintf( '<div class="wpsolr_facet_title %s_%s">%s</div>', self::CLASS_PREFIX, $facet['id'], sprintf( $facet_title, $facet['name'] ) );

				// Use the current facet template, else use the general facets template.
				$facet_template = ! empty( $facet['facet_template'] ) ? $facet['facet_template'] : $facets_template;

				$facet_grid = ! empty( $facet['facet_grid'] ) ? $facet['facet_grid'] : '';
				switch ( $facet_grid ) {
					case WPSOLR_Option::OPTION_FACET_GRID_HORIZONTAL:
						$facet_grid_class = 'wpsolr_facet_column_horizontal';
						break;

					case WPSOLR_Option::OPTION_FACET_GRID_2_COLUMNS:
						$facet_grid_class = 'wpsolr_facet_columns wpsolr_facet_column_2';
						break;

					case WPSOLR_Option::OPTION_FACET_GRID_3_COLUMNS:
						$facet_grid_class = 'wpsolr_facet_columns wpsolr_facet_column_3';
						break;

					default;
						$facet_grid_class = 'wpsolr_facet_columns wpsolr_facet_column_1';
						break;
				}

				$facet_grid_class .= ' wpsolr_facet_scroll';

				self::displayFacetHierarchy( $facet_template, $facet_grid_class, $html, $facet, ! empty( $facet['items'] ) ? $facet['items'] : [] );
			}

			$is_facet_selected           = true;
			$remove_item_localization    = OptionLocalization::get_term( $localization_options, 'facets_element_all_results' );
			$is_generate_facet_permalink = apply_filters( WpSolrFilters::WPSOLR_FILTER_IS_GENERATE_FACET_PERMALINK, false );
			if ( $is_generate_facet_permalink ) {
				// Link to the current page or to the permalinks home ?
				$redirect_facets_home = apply_filters( WpSolrFilters::WPSOLR_FILTER_FACET_PERMALINK_HOME, '' );
				$html_remove_item     = sprintf( '<a class="wpsolr_permalink" href="%s" %s title="%s">%s</a>',
					! empty( $redirect_facets_home ) ? ( '/' . $redirect_facets_home ) : './', '',
					$remove_item_localization, $remove_item_localization );
			} else {
				$html_remove_item = $remove_item_localization;
			}
			$html = sprintf( "<div><label class='wdm_label'>%s</label>
                                    <input type='hidden' name='sel_fac_field' id='sel_fac_field' >
                                    <div class='wdm_ul' id='wpsolr_section_facets'>
                                    <div class='select_opt %s' id='wpsolr_remove_facets' data-wpsolr-facet-data='%s'>%s</div>",
					OptionLocalization::get_term( $localization_options, 'facets_header' ),
					self::WPSOLR_FACET_CHECKBOX_CLASS . ( $is_facet_selected ? ' checked' : '' ),
					wp_json_encode( [ 'type' => WPSOLR_Option::OPTION_FACET_FACETS_TYPE_FIELD ] ),
					$html_remove_item
			        )
			        . $html;

			$html .= '</div></div>';
		}

		return $html;
	}

	/**
	 * @param $facets_layouts
	 * @param $facet_template
	 * @param $facet_grid_class
	 * @param $html
	 * @param $facet
	 * @param $items
	 * @param int $level
	 */
	public static function displayFacetHierarchy( $facet_template, $facet_grid_class, &$html, $facet, $items, $level = 0 ) {

		if ( empty( $items ) ) {
			return;
		}

		$data_facet_type = ! empty( $facet['facet_type'] ) ? $facet['facet_type'] : WPSOLR_Option::OPTION_FACET_FACETS_TYPE_FIELD;

		$html .= sprintf( '<ul class="%s_%s %s" data-wpsolr-facet-type="%s">', self::CLASS_PREFIX, $facet['id'], $facet_grid_class, $data_facet_type );

		$is_facet_selected = false;

		$facet_id = strtolower( str_replace( ' ', '_', $facet['id'] ) );

		$facet_layout_id = ( ! empty( $facet['facet_layout_id'] ) ) ? $facet['facet_layout_id'] : 'id_checkboxes';

		foreach ( $items as $item ) {

			$item_name           = htmlentities( $item['value'] ); // '&' is transformed in '&amp;' to match the values in the index
			$item_localized_name = ! empty( $item['value_localized'] ) ? $item['value_localized'] : $item['value'];
			$item_count          = $item['count'];
			$item_selected       = isset( $item['selected'] ) ? $item['selected'] : false;

			// Check if one facet item is selected (once only).
			if ( $item_selected && ! $is_facet_selected ) {
				$is_facet_selected = true;
			}

			// Choose the facet class in relation with the facet layout.
			switch ( $facet_layout_id ) {
				case WPSOLR_Option::FACETS_LAYOUT_ID_CHECKBOXES:
				case WPSOLR_Option::FACETS_LAYOUT_ID_RANGE_REGULAR_CHECKBOXES:
					$facet_class = self::WPSOLR_FACET_CHECKBOX_CLASS;
					break;

				case WPSOLR_Option::FACETS_LAYOUT_ID_RADIOBOXES:
				case WPSOLR_Option::FACETS_LAYOUT_ID_RANGE_REGULAR_RADIOBOXES:
					$facet_class = self::WPSOLR_FACET_RADIOBOX_CLASS;
					break;

				case WPSOLR_Option::FACETS_LAYOUT_ID_COLOR_PICKER:
					$facet_class = self::WPSOLR_FACET_COLOR_PICKER;
					break;

				default;
					$facet_class = '';
					break;
			}

			$facet_class .= ( $item_selected ? ' checked' : '' );

			// Current class level
			$facet_level = sprintf( '%s_l%s %s_%s', self::CLASS_PREFIX, $level, self::CLASS_PREFIX, empty( $item['items'] ) ? 'no_l' : 'l' );

			$facet_label = '';
			$facet_data  = [
				'id'           => $facet_id,
				'type'         => $data_facet_type,
				'is_permalink' => isset( $facet['is_permalink'] ) ? $facet['is_permalink'] : false,
			];
			switch ( $data_facet_type ) {
				case WPSOLR_Option::OPTION_FACET_FACETS_TYPE_RANGE:
					$facet_data ['item_value']  = $item_name;
					$facet_data ['range_start'] = $item['range_start'];
					$facet_data ['range_end']   = $item['range_end'];

					$facet_label = $item_localized_name;
					$facet_label = str_replace( WPSOLR_Option::FACET_LABEL_TEMPLATE_VAR_START, $item['range_start'], $facet_label );
					$facet_label = str_replace( WPSOLR_Option::FACET_LABEL_TEMPLATE_VAR_END, $item['range_end'], $facet_label );
					$facet_label = str_replace( WPSOLR_Option::FACET_LABEL_TEMPLATE_VAR_COUNT, $item_count, $facet_label );
					break;

				default:
					$facet_data ['item_value'] = $item_name;

					$facet_label = sprintf( $facet_template, $item_localized_name, $item_count );
					break;
			}

			// Encode facet data in json for javascript manipulation.
			$facet_data_json = wp_json_encode( $facet_data );

			$html       .= '<li>';
			$item_value = $facet_data ['item_value'];

			switch ( $facet_layout_id ) {
				case WPSOLR_Option::FACETS_LAYOUT_ID_COLOR_PICKER:
					$html_item = sprintf( '<label style="background-color:%s; color:rgba(148, 148, 148, 1);"><i></i></label>', $item_localized_name );

					if ( isset( $item['permalink'] ) ) {
						$rel       = self::get_html_rel( $item['permalink']['rel'] );
						$html_item = sprintf( self::PERMALINK_LINK_TEMPLATE, $item['permalink']['href'], $rel, $facet_label, $html_item );
					}
					break;

				default:
					$html_item = ( empty( $item['items'] ) ? $facet_label : $item_localized_name ); // only show count on leaf items (else count is false);

					if ( isset( $item['permalink'] ) ) {
						$rel       = self::get_html_rel( $item['permalink']['rel'] );
						$html_item = sprintf( self::PERMALINK_LINK_TEMPLATE, $item['permalink']['href'], $rel, $html_item, $html_item );
					}

					break;
			}

			$html .= "<div class='select_opt $facet_class $facet_level' id='$facet_id:$item_value' data-wpsolr-facet-data='$facet_data_json'>"
			         . $html_item
			         . "</div>";

			if ( ! empty( $item['items'] ) ) {

				self::displayFacetHierarchy( $facet_template, $facet_grid_class, $html, $facet, $item['items'], $level + 1 );
			}

			$html .= '</li>';

		}

		$html .= '</ul>';

	}


	/**
	 * Generate the html link rel attribute.
	 * e.g: rel="noindex, nofollow"
	 *
	 * @param $rel
	 *
	 * @return string
	 */
	protected static function get_html_rel( $rel ) {

		return ! empty( $rel ) ? sprintf( self::TEMPLATE_LINK_REL_ATTRIBUTE, $rel ) : '';
	}
}
