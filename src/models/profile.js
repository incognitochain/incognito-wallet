class Profile {
  constructor(data = {}) {
    this.id = data?.ID;
    this.userName = data?.UserName;
    this.firstName = data?.FirstName;
    this.lastName = data?.LastName;
    this.email = data?.Email;
    this.paymentAddress = data?.PaymentAddress;
    this.bio = data?.Bio;
    this.roleID = data?.RoleID;
  }
}

export default Profile;