<?php
use wpsolr\core\classes\extensions\licenses\OptionLicenses;
use wpsolr\core\classes\services\WPSOLR_Service_Container;
use wpsolr\core\classes\WpSolrSchema;

?>

<div class="wdm_row">
    <div class='col_left'>
		<?php echo $license_manager->show_premium_link( OptionLicenses::LICENSE_PACKAGE_PREMIUM, 'Custom taxonomies to be indexed', true ); ?>
    </div>
    <div class='col_right'>
        <div class='cust_tax'><!--new div class given-->
            <input type='hidden' name='wdm_solr_form_data[taxonomies]'
                   id='tax_types'>
			<?php
			$tax_types_opt = WPSOLR_Service_Container::getOption()->get_option_index_taxonomies_str();
			$disabled      = $license_manager->get_license_enable_html_code( OptionLicenses::LICENSE_PACKAGE_PREMIUM );
			if ( count( $taxonomies ) > 0 ) {

				// Selected first
				foreach ( $taxonomies as $type ) {
					if ( strpos( $tax_types_opt, $type . WpSolrSchema::_SOLR_DYNAMIC_TYPE_STRING ) !== false ) {
						?>

                        <input type='checkbox' name='taxon'
                               value='<?php echo $type . WpSolrSchema::_SOLR_DYNAMIC_TYPE_STRING ?>'
							<?php echo $disabled; ?>
                               checked
                        > <?php echo $type ?> <br>
						<?php
					}
				}

				// Unselected 2nd
				foreach ( $taxonomies as $type ) {
					if ( strpos( $tax_types_opt, $type . WpSolrSchema::_SOLR_DYNAMIC_TYPE_STRING ) === false ) {
						?>

                        <input type='checkbox' name='taxon'
                               value='<?php echo $type . WpSolrSchema::_SOLR_DYNAMIC_TYPE_STRING ?>'
							<?php echo $disabled; ?>
                        > <?php echo $type ?> <br>
						<?php
					}
				}

			} else {
				echo 'None';
			} ?>
        </div>
    </div>
    <div class="clear"></div>
</div>
