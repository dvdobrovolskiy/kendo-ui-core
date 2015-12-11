<%@ Page Title="" Language="C#" MasterPageFile="~/Areas/aspx/Views/Shared/Web.Master" %>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
<%: Html.Kendo().Grid<Kendo.Mvc.Examples.Models.OrderViewModel>()
        .Name("grid")
        .Columns(columns =>
        {
            columns.Bound(p => p.OrderID).Filterable(false);
            columns.Bound(p => p.Freight);
            columns.Bound(p => p.OrderDate).Format("{0:MM/dd/yyyy}");
            columns.Bound(p => p.ShipName);
            columns.Bound(p => p.ShipCity);
        })
        .Pageable()
        .Sortable()
        .Scrollable()
        .Filterable()
        .HtmlAttributes(new { style = "height:550px;" })
        .DataSource(dataSource => dataSource
            .Ajax()
            .PageSize(20)
            .Read(read => read.Action("Orders_Read", "Grid"))
         )
    %>
</asp:Content>
