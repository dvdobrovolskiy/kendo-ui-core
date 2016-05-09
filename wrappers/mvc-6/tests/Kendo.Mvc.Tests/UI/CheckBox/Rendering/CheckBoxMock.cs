﻿using Kendo.Mvc.UI;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.Extensions.WebEncoders;

namespace Kendo.Mvc.Tests
{
    public class CheckBoxMock : CheckBox
    {
        public CheckBoxMock(ViewContext viewContext)
            : base(viewContext)
        {
            Generator = KendoHtmlGeneratorTestHelper.CreateKendoHtmlGenerator(); ;
            HtmlEncoder = new HtmlEncoder();
        }

        protected override CheckBoxHtmlBuilder GetHtmlBuilder()
        {
            return new CheckBoxHtmlBuilderMock(this);
        }
    }
}
