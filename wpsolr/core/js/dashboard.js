// Timout handler on the indexing timeoutHandlerIsCleared;
var timeoutHandler;
var timeoutHandlerIsCleared = false;

jQuery(document).ready(function () {

    /*
     // Instance the tour
     var tour = new Tour({
     name: 'tour5',
     steps: [
     {
     element: "#1wpbody",
     title: "Quick Tour of WPSOLR",
     content: "WPSOLR is so powerfull that it can be overwhelming, compared to classic search solutions. <br/><br/>This tour will show you it's most important concepts and features.",
     orphan: true
     },
     {
     element: "#wpsolr_tour_button_start",
     title: "Stop and resume the Tour",
     content: "Stop the Tour, and resume anytime with this button.",
     backdrop: false,
     backdropPadding: 0,
     },
     {
     element: ".wpsolr-tour-navigation-tabs",
     title: "Navigation tabs",
     content: "Four tabs, it's just what you need to control wpsolr.",
     backdrop: true,
     backdropPadding: 10,
     },
     {
     element: ".wpsolr-tour-navigation-tabs",
     title: "Navigation tabs",
     content: "Four tabs, it's just what you need to control wpsolr.",
     backdrop: true,
     backdropPadding: 10,
     }
     ]
     });

     // Initialize the tour
     tour.init();

     // Start the tour
     tour.start();

     // Restart the tour
     jQuery('#wpsolr_tour_button_start').click(function (e) {
     tour.start(true);
     });
     */

    // Remove empty fields on saved form.
    jQuery(document).on('change', '#index_engine', function (e) {

        // Toggle elements
        jQuery('.show_' + this.value).show();
        jQuery('.hide_' + this.value).hide();

    });


    function remove_empty_values() {
        jQuery(".wpsolr-remove-if-empty").filter(function () {
            return ((this.value === "") || (this.value === jQuery(this).data('wpsolr-empty-value')));
        }).remove();
    }

    function remove_hidden_values() {
        jQuery(".wpsolr-remove-if-hidden").filter(":hidden").remove();
    }

    // Remove empty fields on saved form.
    jQuery('#save_facets_options_form,#save_scoring').click(function (e) {
        remove_empty_values();
        remove_hidden_values();
    });

    // Collapse/uncollapse in checkbox
    jQuery('.wpsolr_collapser:checkbox').each(function (e) {
        if (undefined !== jQuery(this).filter(':checked').val()) {
            jQuery(this).siblings('.wpsolr_collapsed').show();
        }
    });
    jQuery(document).on('click', '.wpsolr_collapser:checkbox', function (e) {
        jQuery(this).siblings('.wpsolr_collapsed').toggle();
    });

    // Collapse/uncollapse in a radio
    jQuery('.wpsolr_collapser:radio').each(function (e) {
        if (undefined !== jQuery(this).filter(':checked').val()) {
            jQuery(this).siblings('.wpsolr_collapsed').show();
        }
    });
    jQuery(document).on('click', '.wpsolr_collapser:radio', function (e) {
        jQuery('input[name="' + jQuery(this).attr('name') + '"]').siblings('.wpsolr_collapsed').hide();
        jQuery(this).siblings('.wpsolr_collapsed').show();
    });

    jQuery(document).on('click', 'div.wpsolr_collapser,.wpsolr_collapser:button', function (e) {
        jQuery(this).next('.wpsolr_collapsed').toggle();
    });

    // Simulate a combobox with checkboxes, when it's class is like 'wpsolr_checkbox_mono_someidhere'
    jQuery('[class^="wpsolr_checkbox_mono"]').change(function () {

        if (jQuery(this).prop("checked")) {
            var classes = jQuery(this).prop("class");
            var matches = classes.match(/wpsolr_checkbox_(\w+)/g);

            // Deactivate all checks with same class
            jQuery('.' + matches[0]).not(this).filter(":checked").prop("checked", false).css('background-color', 'yellow');
        }

    });

    jQuery(".radio_type").change(function () {

        if (jQuery("#self_host").attr("checked")) {
            jQuery('#div_self_hosted').slideDown("slow");
            jQuery('#hosted_on_other').css('display', 'none');
        }
        else if (jQuery("#other_host").attr("checked")) {
            jQuery('#hosted_on_other').slideDown("slow");
            jQuery('#div_self_hosted').css('display', 'none');


        }
    });

    // Stop the current Solr index process
    jQuery('#solr_stop_delete_data').click(function () {

        jQuery('#solr_stop_delete_data').attr('value', 'Stopping ... please wait');
        jQuery('#solr_actions').submit();
    });

    // Clean the Solr index
    jQuery('#solr_delete_index').click(function (e) {

        // Block submit while Ajax is running
        e.preventDefault();

        jQuery('.status_del_message').addClass('loading');
        jQuery('#solr_stop_delete_data').css('visibility', 'visible');
        jQuery('#solr_delete_index').hide();
        jQuery('#solr_start_index_data').attr("disabled", true);


        var path = jQuery('#adm_path').val();
        var solr_index_indice = jQuery('#solr_index_indice').val();

        var request = jQuery.ajax({
            url: path + 'admin-ajax.php',
            type: "post",
            dataType: "json",
            timeout: 1000 * 3600 * 24,
            data: {
                action: 'return_solr_delete_index',
                solr_index_indice: solr_index_indice,
                security: jQuery(wpsolr_localize_script_dashboard.wpsolr_dashboard_nonce_selector).val()
            }
        });

        request.done(function (data) {

            // Errors
            if (data && (data.status != 0 || data.message)) {
                jQuery('.status_index_message').html('<br><br>An error occured: <br><br>' + data.message);

                // Block submit
                return false;
            }

            jQuery('#solr_actions').submit();
        });

        request.fail(function (req, status, error) {

            if (error) {

                jQuery('.status_index_message').html('<br><br>An error or timeout occured. <br><br>' + '<b>Error code:</b> ' + status + '<br><br>' + '<b>Error message:</b> ' + escapeHtml(error) + '<br><br>' + escapeHtml(req.responseText) + '<br><br>');

            }

        });

    });

    // Stop the current Solr index process
    jQuery('#solr_stop_index_data').click(function () {

        jQuery('#solr_stop_index_data').attr('value', 'Stopping ... please wait');

        clearTimeout(timeoutHandler);

        timeoutHandlerIsCleared = true;
    });

    // Fill the Solr index
    jQuery('#solr_start_index_data').click(function () {

        jQuery('.img-load').css('display', 'inline-block');

        jQuery('#solr_stop_index_data').css('visibility', 'visible');
        jQuery('#solr_start_index_data').hide();
        jQuery('#solr_delete_index').hide();

        var solr_index_indice = jQuery('#solr_index_indice').val();
        var batch_size = jQuery('#batch_size').val();
        var is_debug_indexing = jQuery('#is_debug_indexing').prop('checked');
        var is_reindexing_all_posts = jQuery('#is_reindexing_all_posts').prop('checked');

        var err = 1;

        if (isNaN(batch_size) || (batch_size < 1)) {
            jQuery('.res_err').text("Please enter a number > 0");
            err = 0;
        }
        else {
            jQuery('.res_err').text();
        }

        if (err == 0) {
            return false;
        } else {

            call_solr_index_data(solr_index_indice, batch_size, 0, is_debug_indexing, is_reindexing_all_posts);

            // Block submit
            return false;
        }

    });


    // Promise to the Ajax call
    function call_solr_index_data(solr_index_indice, batch_size, nb_results, is_debug_indexing, is_reindexing_all_posts) {

        var nb_results_message = nb_results + ' documents indexed so far'

        jQuery('.status_index_message').html(nb_results_message);

        var path = jQuery('#adm_path').val();

        var request = jQuery.ajax({
            url: path + 'admin-ajax.php',
            type: "post",
            data: {
                action: 'return_solr_index_data',
                solr_index_indice: solr_index_indice,
                batch_size: batch_size,
                nb_results: nb_results,
                is_debug_indexing: is_debug_indexing,
                is_reindexing_all_posts: is_reindexing_all_posts,
                security: jQuery(wpsolr_localize_script_dashboard.wpsolr_dashboard_nonce_selector).val()
            },
            dataType: "json",
            timeout: 1000 * 3600 * 24
        });

        request.done(function (data) {

            if (data.debug_text) {
                // Debug

                jQuery('.status_debug_message').append('<br><br>' + data.debug_text);

                if (data.indexing_complete) {
                    // Freeze the screen to have time to read debug infos
                    return false;
                }

            }

            if (data.status != 0 || data.message) {
                // Errors

                jQuery('.status_index_message').html('<br><br>An error occured: <br><br>' + data.message);

            }
            else if (!data.indexing_complete) {

                // If indexing completed, stop. Else, call once more.
                // Do not re-index all, again !
                is_reindexing_all_posts = false;
                timeoutHandler = setTimeout(call_solr_index_data(solr_index_indice, batch_size, data.nb_results, is_debug_indexing, is_reindexing_all_posts), 100);


            } else {

                jQuery('#solr_stop_index_data').click();

            }
        });


        request.fail(function (req, status, error) {

            if (error) {

                var message = '';
                if (batch_size > 100) {
                    message = '<br> You could try to decrease your batch size to prevent errors or timeouts.';
                }
                jQuery('.status_index_message').html('<br><br>An error or timeout occured. <br><br>' + '<b>Error code:</b> ' + status + '<br><br>' + '<b>Error message:</b> ' + escapeHtml(error) + '<br><br>' + escapeHtml(req.responseText) + '<br><br>' + message);
            }

        });

    }

    /*
     Escape html for javascript error messages to be displayed correctly.
     */
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    jQuery('#save_selected_index_options_form').click(function () {
        var ps_types = '';
        var tax = '';
        var fields = '';
        var attachment_types = '';

        jQuery("input:checkbox[name=post_tys]:checked").each(function () {
            ps_types += jQuery(this).val() + ',';
        });
        var pt_tp = ps_types.substring(0, ps_types.length - 1);
        jQuery('#p_types').val(pt_tp);

        jQuery("input:checkbox[name=attachment_types]:checked").each(function () {
            attachment_types += jQuery(this).val() + ',';
        });
        attachment_types = attachment_types.substring(0, attachment_types.length - 1);
        jQuery('#attachment_types').val(attachment_types);

        jQuery("input:checkbox[name=taxon]:checked").each(function () {
            tax += jQuery(this).val() + ',';
        });
        var tx = tax.substring(0, tax.length - 1);
        jQuery('#tax_types').val(tx);

        jQuery("input:checkbox[name=cust_fields]:checked").each(function () {
            fields += jQuery(this).val() + ',';
        });
        var fl = fields.substring(0, fields.length - 1);
        jQuery('#field_types').val(fl);


    });

    jQuery('#save_facets_options_form, #save_fields_options_form, #save_scoring').click(function () {
        var result = '';
        jQuery(".facet_selected").each(function () {
            result += jQuery(this).attr('id') + ",";
        });
        result = result.substring(0, result.length - 1);

        jQuery("#select_fac").val(result);

    });

    jQuery('#save_sort_options_form').click(function () {

        var result = '';
        jQuery(".sort_selected").each(function () {
            result += jQuery(this).attr('id') + ",";
        });
        result = result.substring(0, result.length - 1);

        jQuery("#select_sort").val(result);

    });

    jQuery('#save_selected_res_options_form').click(function () {
        var num_of_res = jQuery('#number_of_res').val();
        var num_of_fac = jQuery('#number_of_fac').val();
        var highlighting_fragsize = jQuery('#highlighting_fragsize').val();
        var err = 1;
        if (isNaN(num_of_res)) {
            jQuery('.res_err').text("Please enter valid number of results");
            err = 0;
        }
        else if (num_of_res < 1 || num_of_res > 100) {
            jQuery('.res_err').text("Number of results must be between 1 and 100");
            err = 0;
        }
        else {
            jQuery('.res_err').text();
        }

        if (isNaN(num_of_fac)) {
            jQuery('.fac_err').text("Please enter valid number of facets");
            err = 0;
        }
        else if (num_of_fac < 0) {
            jQuery('.fac_err').text("Number of facets must be >= 0");
            err = 0;
        }
        else {
            jQuery('.fac_err').text();

        }

        if (isNaN(highlighting_fragsize)) {
            jQuery('.highlighting_fragsize_err').text("Please enter a valid Highlighting fragment size");
            err = 0;
        }
        else if (highlighting_fragsize < 1) {
            jQuery('.highlighting_fragsize_err').text("Highlighting fragment size must be > 0");
            err = 0;
        }
        else {
            jQuery('.highlighting_fragsize_err').text();

        }

        if (err == 0)
            return false;
    });

    jQuery('#save_selected_extension_groups_form').click(function () {
        var err = 1;
        if (err == 0)
            return false;
    });

    jQuery('#save_fields_options_form').click(function () {

        var err = 1;

        // Clear errors
        jQuery('.res_err').empty();

        // Verify each boost factor is a numbers > 0
        jQuery(".wpsolr_field_boost_factor_class").each(function () {

            if (jQuery(this).data('wpsolr_is_error')) {
                jQuery(this).css('border-color', 'green');
                jQuery(this).data('wpsolr_is_error', false);
            }

            var boost_factor = jQuery(this).val();
            if (isNaN(boost_factor) || (boost_factor <= 0)) {

                jQuery(this).data('wpsolr_is_error', true);
                jQuery(this).css('border-color', 'red');
                jQuery(this).after("<span class='res_err'>Please enter a number > 0. Examples: '0.5', '2', '3.1'</span>");
                err = 0;
            }

            if ('none' == jQuery(this).css('display')) {
                jQuery(this).remove();
            }

        });

        // Verify each boost term factor
        jQuery(".wpsolr_field_boost_term_factor_class").each(function () {

            if ('none' == jQuery(this).css('display')) {
                jQuery(this).remove();
            }

        });

        if (err == 0) {
            return false;
        }

    });

    /*
     Create a temporary managed index
     */
    jQuery("input[name='submit_button_form_temporary_index']").click(function () {

        // Display the loading icon
        jQuery(this).hide();
        jQuery('.solr_error').hide();
        jQuery('.wdm_note').hide();
        jQuery(this).after("<h2>Please wait a few seconds. We are configuring your test Solr index ...</h2>");
        jQuery(this).after("<div class='loading'>");

        // Let the submit execute by doing nothing
        return true;
    });

    /*
     Remove an index configuration
     */
    jQuery('#delete_index_configuration').click(function () {

        // Remove the current configuration to delete from the DOM
        jQuery('#current_index_configuration_edited_id').remove();

        // Autosubmit
        jQuery('#settings_conf_form').submit();
    });


    jQuery('#check_index_status').click(function () {

        var me = jQuery(this);

        var path = jQuery('#adm_path').val();

        var index_engine = jQuery('#index_engine').val();
        var name = jQuery('#index_name').filter(':visible').val();
        var index_label = jQuery('#index_label').val();
        var host = jQuery('#index_host').val();
        var port = jQuery('#index_port').val();
        var spath = jQuery('#index_path').val();
        var pwd = jQuery('#index_secret').val();
        var user = jQuery('#index_key').val();
        var protocol = jQuery('#index_protocol').val();

        var error = 0;

        if (name == '') {
            jQuery('.name_err').text('Please enter a configuration name');
            error = 1;
        }
        else {
            jQuery('.name_err').text('');
        }

        if (('engine_elasticsearch' === index_engine) && (index_label == '')) {
            jQuery('.label_err').text('Please enter an Elasticsearch index name');
            error = 1;
        }
        else {
            jQuery('.label_err').text('');
        }

        if (('engine_elasticsearch' !== index_engine) && (spath == '')) {
            jQuery('.path_err').text('Please enter a path for your index');
            error = 1;
        }
        else {
            // Remove last '/'
            if (spath.substr(spath.length - 1, 1) == '/') {
                spath = spath.substr(0, spath.length - 1);
                jQuery('#index_path').val(spath);
            }

            jQuery('.path_err').text('');
        }

        if (host == '') {
            jQuery('.host_err').text('Please enter an index host');
            error = 1;
        }
        else {
            jQuery('.host_err').text('');
        }

        if (isNaN(port) || port.length < 2) {
            jQuery('.port_err').text('Please enter a valid port');
            error = 1;
        }
        else
            jQuery('.port_err').text('');


        if (error == 1)
            return false;
        else {
            jQuery('.img-succ').css('display', 'none');
            jQuery('.img-err').css('display', 'none');
            jQuery('.img-load').css('display', 'inline-block');

            me.prop("disabled", true);

            jQuery.ajax({
                url: path + 'admin-ajax.php',
                type: "post",
                data: {
                    action: 'return_solr_instance',
                    'sindex_engine': index_engine,
                    'sproto': protocol,
                    'shost': host,
                    'sport': port,
                    'spath': spath,
                    'slabel': index_label,
                    'spwd': pwd,
                    'skey': user,
                    security: jQuery(wpsolr_localize_script_dashboard.wpsolr_dashboard_nonce_selector).val()
                },
                timeout: 10000,
                success: function (data1) {

                    jQuery('.img-load').css('display', 'none');
                    if ('0' === data1) {
                        jQuery('.solr_error').html('');
                        jQuery('.img-succ').css('display', 'inline');
                        me.prop("style", 'background-color: rgba(46, 222, 121, 1) !important;border-color:white;color:white !important;');
                        me.val('Index configuration verified. Saving now ...');

                        jQuery('#settings_conf_form').submit();
                    }
                    else if ('1' === data1) {
                        me.prop("disabled", false);
                        jQuery('.solr_error').text('Error in detecting solr instance');
                    }
                    else {
                        me.prop("disabled", false);
                        me.prop("style", 'background-color: red !important;border-color:white');
                        me.val('Index configuration failed. Check the error message, then try again ...');
                        jQuery('.solr_error').html(data1);
                    }

                },
                error: function (req, status, error) {

                    me.prop("disabled", false);
                    jQuery('.img-load').css('display', 'none');

                    jQuery('.solr_error').text('Timeout: we had no response from your Solr server in less than 10 seconds. It\'s probably because port ' + port + ' is blocked. Please try another port, for instance 443, or contact your hosting provider to unblock port ' + port + '.');
                }
            });

        }


    })


    jQuery('.plus_icon').click(function () {
        jQuery(this).parent().addClass('facet_selected');
        jQuery(this).hide();
        jQuery(this).parent().find('.wdm_row').find('*').css('display', 'block');
        jQuery(this).siblings('img').css('display', 'inline');
    })

    jQuery('.minus_icon').click(function () {
        jQuery(this).parent().removeClass('facet_selected');
        jQuery(this).hide();
        jQuery(this).parent().find('.wdm_row').find('*').css('display', 'none');
        jQuery(this).siblings('img').css('display', 'inline');
    })

    jQuery("#sortable1").sortable(
        {
            connectWith: ".connectedSortable",
            stop: function (event, ui) {
                jQuery('.connectedSortable').each(function () {
                    var result = "";
                    jQuery(this).find(".facet_selected").each(function () {
                        result += jQuery(this).attr('id') + ",";
                    });
                    result = result.substring(0, result.length - 1);

                    jQuery("#select_fac").val(result);
                });
            }
        });


    jQuery('.plus_icon_sort').click(function () {
        jQuery(this).parent().addClass('sort_selected');
        jQuery(this).hide();
        jQuery(this).parent().find('.wdm_row').find('*').css('display', 'block');
        jQuery(this).siblings('img').css('display', 'inline');
    })

    jQuery('.minus_icon_sort').click(function () {
        jQuery(this).parent().removeClass('sort_selected');
        jQuery(this).hide();
        jQuery(this).parent().find('.wdm_row').find('*').css('display', 'none');
        jQuery(this).siblings('img').css('display', 'inline');
    })

    jQuery("#sortable_sort").sortable(
        {
            connectWith: ".connectedSortable_sort",
            stop: function (event, ui) {
                jQuery('.connectedSortable_sort').each(function () {
                    var result = "";
                    jQuery(this).find(".sort_selected").each(function () {
                        result += jQuery(this).attr('id') + ",";
                    });
                    result = result.substring(0, result.length - 1);

                    jQuery("#select_sort").val(result);

                });
            }
        });


})
;
