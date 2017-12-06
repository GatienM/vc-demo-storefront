﻿using System.Runtime.Serialization;
using Newtonsoft.Json;
using VirtoCommerce.Storefront.Model.Common;
using VirtoCommerce.Storefront.Model.Wholesaler;

namespace VirtoCommerce.Storefront.Model.Customer
{
    public partial class Contact
    {
        [JsonIgnore]
        [IgnoreDataMember]
        public IMutablePagedList<Wholesaler.Wholesaler> Wholesalers { get; set; }
    }
}
