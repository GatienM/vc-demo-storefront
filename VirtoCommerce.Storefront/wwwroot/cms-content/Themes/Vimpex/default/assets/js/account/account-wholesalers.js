﻿angular.module('storefront.account')
    .component('vcAccountWholesalers', {
        templateUrl: "themes/assets/account-wholesalers.tpl.liquid",
        $routeConfig: [
            { path: '/', name: 'WholesalersList', component: 'vcAccountWholesalersList', useAsDefault: true },
            { path: '/:wholesaler', name: 'WholesalerDetail', component: 'vcAccountWholesalerDetail' }
        ],
        controller: ['storefront.wholesalersApi', function (accountApi) {
            var $ctrl = this;
        }]
    })

    .component('vcAccountWholesalersList', {
        templateUrl: "account-wholesalers.tpl",
        bindings: { $router: '<' },
        controller: ['storefrontApp.mainContext', '$scope', 'storefront.wholesalersApi', 'storefront.corporateApiErrorHelper', 'loadingIndicatorService', 'confirmService', '$location', '$translate', function (mainContext, $scope, wholesalersApi, corporateApiErrorHelper, loader, confirmService, $location, $translate) {
            var $ctrl = this;
            $ctrl.currentMemberId = mainContext.customer.id;
            $ctrl.newMemberComponent = null;
            $ctrl.loader = loader;
            $ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5, numPages: 10 };
            $ctrl.pageSettings.pageChanged = function () {
                loader.wrapLoading(function () {
                    return wholesalersApi.getWholesalersList(function (data) {
                        $ctrl.entries = data;
                        $ctrl.pageSettings.totalItems = data.length;                      
                    }).$promise;
                });
            };         

            $scope.init = function (storeId, cultureName, registrationUrl) {
                $ctrl.storeId = storeId;
                $ctrl.cultureName = cultureName;
                $ctrl.registrationUrl = registrationUrl;
            };

            this.$routerOnActivate = function (next) {
                $ctrl.pageSettings.currentPage = next.params.pageNumber || $ctrl.pageSettings.currentPage;
            };

            $scope.$watch(
                function () { return mainContext.customer; },
                function (customer) {                 
                        $ctrl.pageSettings.pageChanged();                    
                }
            );
                    

            $ctrl.edit = function (memberId) {
                this.$router.navigate(['MemberDetail', { member: memberId, pageNumber: $ctrl.pageSettings.currentPage }]);
            }
            
            $ctrl.validate = function () {
                $ctrl.inviteForm.$setSubmitted();
                return $ctrl.inviteForm.valid;
            };

            $ctrl.showActions = function (member) {
                return member.id != mainContext.customer.id;
            }
        }]
    })
    .component('vcAccountWholesalerDetail', {
        templateUrl: "account-company-members-detail.tpl",
        require: {
            accountManager: '^vcAccountManager'
        },
        controller: ['$q', '$rootScope', '$scope', '$window', 'roleService', 'storefront.corporateAccountApi', 'storefront.corporateApiErrorHelper', 'loadingIndicatorService', 'confirmService', function ($q, $rootScope, $scope, $window, roleService, corporateAccountApi, corporateApiErrorHelper, loader, confirmService) {
            var $ctrl = this;
            $ctrl.loader = loader;
            $ctrl.fieldsConfig = [
                {
                    field: 'CompanyName',
                    disabled: true,
                    visible: false,
                    required: false
                },
                {
                    field: 'Email',
                    disabled: false,
                    visible: true,
                    required: true
                },
                {
                    field: 'UserName',
                    disabled: true,
                    visible: false
                },
                {
                    field: 'Password',
                    disabled: true,
                    visible: false
                },
                {
                    field: 'Roles',
                    disabled: false,
                    visible: true
                }
            ];

            $ctrl.memberComponent = null;

            $scope.init = function (storeId) {
                $ctrl.storeId = storeId;
            };

            function refresh() {
                loader.wrapLoading(function () {
                    return corporateAccountApi.getCompanyMember({ id: $ctrl.memberNumber }, function (member) {
                        $ctrl.member = {
                            id: member.id,
                            firstName: member.firstName,
                            lastName: member.lastName,
                            email: _.first(member.emails),
                            organizations: member.organizations,
                            title: member.title,
                            securityAccounts: member.securityAccounts
                        };
                    }).$promise;
                });
            }

            this.$routerOnActivate = function (next) {
                $ctrl.pageNumber = next.params.pageNumber || 1;
                $ctrl.memberNumber = next.params.member;

                refresh();
            };

            $ctrl.submitMember = function () {
                if ($ctrl.memberComponent.validate()) {
                    loader.wrapLoading(function () {
                        $ctrl.member.fullName = $ctrl.member.firstName + ' ' + $ctrl.member.lastName;
                        $ctrl.member.emails = [$ctrl.member.email];
                        return $q.all([
                            roleService.set($ctrl.member.securityAccounts, $ctrl.member.role),
                            corporateAccountApi.updateCompanyMember($ctrl.member, function (response) {
                                corporateApiErrorHelper.clearErrors($scope);
                            }, function (rejection) {
                                corporateApiErrorHelper.handleErrors($scope, rejection);
                            }).$promise
                        ]);
                    });
                };
            };
        }]
    });
